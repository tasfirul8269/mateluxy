import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';

// Import the CSS file
import './mapView.css';

// We'll load Leaflet dynamically after component mounts

const MapView = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default center is Dubai
  const defaultCenter = [25.2048, 55.2708];
  
  // Get category from URL (buy, rent, commercial-buy, commercial-rent)
  const pathSegments = location.pathname.split('/');
  const urlCategory = pathSegments[2] || 'buy';

  // Convert URL category to actual property category
  let category;
  switch(urlCategory) {
    case 'commercial-buy':
      category = 'Commercial for Buy';
      break;
    case 'commercial-rent':
      category = 'Commercial for Rent';
      break;
    case 'rent':
      category = 'Rent';
      break;
    case 'buy':
    default:
      category = 'Buy';
  }

  // This is now moved inside the useEffect to avoid dependency issues

  // Cleanup is now handled in the main useEffect

  // Fetch properties and initialize map - only run once on mount
  useEffect(() => {
    // Set a flag to track if this component is mounted
    let isMounted = true;
    
    // Define fetchProperties inside the effect to avoid dependency issues
    const fetchPropertiesInEffect = () => {
      if (!isMounted) return;
      
      setLoading(true);
      console.log('Fetching properties for category:', category);
      
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/properties`)
        .then((res) => {
          if (!isMounted) return;
          
          // Filter by category
          const filteredProperties = res.data.filter(property => property.category === category);
          
          // Log the properties to help with debugging
          console.log(`Found ${filteredProperties.length} ${category} properties`);
          
          // Add coordinates to properties
          const propertiesWithCoords = filteredProperties.map(property => {
            // If property has coordinates, use them
            if (property.latitude && property.longitude) {
              return property;
            }
            
            // If property has GeoJSON coordinates, convert them
            if (property.location && property.location.coordinates && 
                Array.isArray(property.location.coordinates) && 
                property.location.coordinates.length === 2) {
              return {
                ...property,
                latitude: property.location.coordinates[1],
                longitude: property.location.coordinates[0]
              };
            }
            
            // Otherwise generate random coordinates around Dubai
            return {
              ...property,
              latitude: defaultCenter[0] + (Math.random() - 0.5) * 0.1,
              longitude: defaultCenter[1] + (Math.random() - 0.5) * 0.1
            };
          });
          
          setProperties(propertiesWithCoords);
          
          // Extract unique locations
          const locationSet = new Set();
          propertiesWithCoords.forEach(property => {
            if (property.propertyState) {
              locationSet.add(property.propertyState);
            }
          });
          
          // Create location objects with coordinates
          const locationArray = Array.from(locationSet).map(locationName => {
            const propertiesInLocation = propertiesWithCoords.filter(p => p.propertyState === locationName);
            const count = propertiesInLocation.length;
            
            // Use the first property's coordinates for the location
            const coordinates = propertiesInLocation.length > 0 ?
              [propertiesInLocation[0].latitude, propertiesInLocation[0].longitude] :
              defaultCenter;
            
            return { name: locationName, coordinates, count };
          });
          
          setLocations(locationArray);
          setLoading(false);
          
          // Initialize map after properties are loaded with a longer delay
          if (isMounted) {
            setTimeout(() => {
              if (!isMounted) return;
              
              if (mapContainerRef.current) {
                console.log('Map container ref found, initializing map...');
                initializeMap(propertiesWithCoords);
              } else {
                console.error('Map container ref still not found after delay');
                setError('Could not initialize map: container not found');
              }
            }, 1000); // Even longer delay to ensure DOM is fully ready
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Error fetching properties:', err);
          setError(err.message);
          setLoading(false);
        });
    };
    
    // Check if Leaflet script is already loaded
    if (window.L) {
      console.log('Leaflet already loaded, fetching properties...');
      fetchPropertiesInEffect();
    } else {
      // Load Leaflet script if not already loaded
      const loadScript = () => {
        // Check if script is already in document
        const existingScript = document.querySelector('script[src*="leaflet"]');
        if (existingScript) {
          console.log('Leaflet script already exists, fetching properties...');
          fetchPropertiesInEffect();
          return;
        }
        
        console.log('Loading Leaflet script...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          if (!isMounted) return;
          
          console.log('Leaflet script loaded successfully');
          // Load CSS
          const existingLink = document.querySelector('link[href*="leaflet"]');
          if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
          }
          
          // Now fetch properties
          fetchPropertiesInEffect();
        };
        script.onerror = () => {
          if (!isMounted) return;
          console.error('Failed to load Leaflet script');
          setError('Failed to load map library');
          setLoading(false);
        };
        document.head.appendChild(script);
      };
      
      // Start loading process
      loadScript();
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (window.map) {
        console.log('Cleaning up map on unmount...');
        window.map.remove();
        window.map = null;
        window.markers = [];
      }
    };
  }, []); // Empty dependency array to run only once on mount

  // Handle back button click
  const handleBack = () => {
    switch(urlCategory) {
      case 'commercial-buy':
        navigate('/commercial/buy');
        break;
      case 'commercial-rent':
        navigate('/commercial/rent');
        break;
      case 'rent':
        navigate('/rent');
        break;
      case 'buy':
      default:
        navigate('/buy');
    }
  };
  
  // Handle location selection for quick navigation
  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc.coordinates);
    
    // Fly to the location
    if (window.map) {
      try {
        window.map.flyTo(loc.coordinates, 13, {
          animate: true,
          duration: 1.5
        });
      } catch (err) {
        console.error('Error navigating to location:', err);
      }
    }
  };
  
  // Initialize map function
  const initializeMap = (propertiesData) => {
    // Check if Leaflet is loaded
    if (!window.L) {
      console.error('Leaflet not loaded');
      setError('Map library not loaded properly');
      return;
    }
    
    // Get map container using ref
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) {
      console.error('Map container ref not found');
      return;
    }
    
    console.log('Map container dimensions:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight);
    
    // Check if map is already initialized
    if (window.map) {
      console.log('Map already exists, updating data...');
      
      // Clear existing markers
      if (window.markers && window.markers.length) {
        window.markers.forEach(marker => {
          if (marker) marker.remove();
        });
      }
      
      // Reset markers array
      window.markers = [];
    } else {
      console.log('Creating new map...');
      
      // Create map using the DOM element directly
      try {
        window.map = window.L.map(mapContainerRef.current).setView(defaultCenter, 12);
        
        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.map);
        
        console.log('Map created successfully');
      } catch (err) {
        console.error('Error creating map:', err);
        setError('Failed to initialize map: ' + err.message);
        return;
      }
    }
    
    // Create custom icon
    const propertyIcon = window.L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35]
    });
    
    // Initialize markers array if it doesn't exist
    if (!window.markers) window.markers = [];
    
    // Add markers for properties
    propertiesData.forEach(property => {
      if (!property.latitude || !property.longitude) return;
      
      try {
        const marker = window.L.marker([property.latitude, property.longitude], { icon: propertyIcon })
          .addTo(window.map);
        
        // Store marker reference for later cleanup
        window.markers.push(marker);
        
        // Create popup content with enhanced styling
        const popupContent = document.createElement('div');
        popupContent.className = 'property-popup';
        
        // Format price properly
        const formattedPrice = property.propertyPrice ? 
          property.propertyPrice.toLocaleString('en-US', {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
          }) : '0';
        
        // Get a clean title
        const propertyTitle = property.propertyTitle || 
          `${property.propertyBedrooms || 0} Bedroom ${property.propertyType || 'Property'}`;
        
        // Get location
        const location = [
          property.propertyAddress, 
          property.propertyState
        ].filter(Boolean).join(', ');
        
        popupContent.innerHTML = `
          <div class="property-popup-image">
            <img 
              src="${property.propertyFeaturedImage || 'https://via.placeholder.com/400x300?text=Property'}"
              alt="${propertyTitle}"
              onerror="this.src='https://via.placeholder.com/400x300?text=Property'"
            />
            <div class="property-popup-badge">${property.category}</div>
          </div>
          
          <div class="property-popup-content">
            <div class="property-popup-title">${propertyTitle}</div>
            
            <div class="property-popup-price">
              AED ${formattedPrice}
              ${property.category === 'Rent' ? '<span>/month</span>' : ''}
            </div>
            
            <div class="property-popup-location">
              ${location || 'Location not specified'}
            </div>
            
            <div class="property-popup-features">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 22v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8"></path>
                  <path d="M1 22h22"></path>
                  <path d="M14 10v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
                </svg>
                ${property.propertyBedrooms || 0} Beds
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                  <line x1="10" y1="5" x2="8" y2="7"></line>
                  <line x1="2" y1="16" x2="22" y2="16"></line>
                </svg>
                ${property.propertyBathrooms || 0} Baths
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                </svg>
                ${property.propertySize || 0} sq.ft
              </span>
            </div>
            
            <button 
              class="property-popup-button"
              onclick="window.location.href='/property-details/${property._id}'"
            >
              View Details
            </button>
          </div>
        `;
        
        marker.bindPopup(popupContent);
      } catch (err) {
        console.error('Error creating marker:', err);
      }
    });
    
    console.log('Map markers added successfully');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-3 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft className="text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {urlCategory.includes('commercial') ? 'Commercial' : ''} Properties {category.includes('Buy') ? 'for sale' : 'for rent'} on Map
            </h1>
          </div>
          <div className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-md">
            {properties.length} Properties
          </div>
        </div>
        
        {/* Quick Navigation */}
        {locations.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <div className="flex items-center space-x-1 mb-2">
              <FaLocationArrow className="text-red-600" />
              <span className="font-medium">Quick Navigation:</span>
            </div>
            
            <div className="flex flex-nowrap overflow-x-auto pb-2 space-x-2">
              {locations.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleLocationSelect(loc)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedLocation && 
                    selectedLocation[0] === loc.coordinates[0] && 
                    selectedLocation[1] === loc.coordinates[1] 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <FaMapMarkerAlt />
                  <span>{loc.name}</span>
                  <span className="bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5 text-xs ml-1">
                    {loc.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div className="flex-grow relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-xl text-gray-600">
            {loading ? 'Loading map...' : error ? `Error: ${error}` : ''}
          </div>
        </div>
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '500px', height: '70vh', position: 'relative', zIndex: 1 }}></div>
      </div>
    </div>
  );
};

export default MapView;
