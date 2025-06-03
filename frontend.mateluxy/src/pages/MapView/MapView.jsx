import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatPrice';

// Import the CSS file
import './mapView.css';

const MapView = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);
  const clustererRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default center is Dubai
  const defaultCenter = { lat: 25.2048, lng: 55.2708 };
  
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

  useEffect(() => {
    let isMounted = true;
    
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/properties?category=${category}`);
        
        if (!isMounted) return;
        
        // Filter properties with valid coordinates
        const propertiesWithCoords = response.data.filter(property => 
          property.latitude && 
          property.longitude && 
          !isNaN(parseFloat(property.latitude)) && 
          !isNaN(parseFloat(property.longitude))
        );
        
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
            { lat: propertiesInLocation[0].latitude, lng: propertiesInLocation[0].longitude } :
            defaultCenter;
          
          return { name: locationName, coordinates, count };
        });
        
        setLocations(locationArray);
        setLoading(false);
        
        // Initialize map after properties are loaded
        if (isMounted && mapContainerRef.current) {
          initializeMap(propertiesWithCoords);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching properties:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [category]);

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
    
    // Update map view
    if (mapRef.current) {
      mapRef.current.setCenter(loc.coordinates);
      mapRef.current.setZoom(13);
    }
  };

  // Initialize map function
  const initializeMap = (propertiesData) => {
    if (!mapContainerRef.current) return;

    try {
      // Load Google Maps JavaScript API and MarkerClusterer
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAb7m_WnewNIpg_xU2_5vhfZmCSD-Y9suU&callback=initMapCallback`;
      script.async = true;
      script.defer = true;

      // Load MarkerClusterer library
      const clustererScript = document.createElement('script');
      clustererScript.src = 'https://unpkg.com/@googlemaps/markerclusterer@2.4.0/dist/index.min.js';
      clustererScript.async = true;
      clustererScript.defer = true;

      window.initMapCallback = () => {
        if (!mapContainerRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });
        mapRef.current = map;

        markersRef.current.forEach(marker => marker.setMap(null));
        infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
        markersRef.current = [];
        infoWindowsRef.current = [];

        // Custom house SVG icon for individual properties (blue)
        const houseIcon = {
          url: 'data:image/svg+xml;utf8,<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" fill="none"/><path d="M18 7L7 17H11V29H25V17H29L18 7Z" fill="%232563eb" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="15" y="21" width="6" height="8" rx="1" fill="white"/></svg>',
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36)
        };

        // Red pointer SVG for clusters
        const redPointerIcon = {
          url: 'data:image/svg+xml;utf8,<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="36" height="36" fill="none"/><path d="M18 2C11.3726 2 6 7.37258 6 14C6 23.25 18 34 18 34C18 34 30 23.25 30 14C30 7.37258 24.6274 2 18 2Z" fill="%23e53e3e" stroke="white" stroke-width="2"/><circle cx="18" cy="14" r="5" fill="white"/></svg>',
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36)
        };

        // Track open InfoWindow and marker
        let openInfoWindow = null;
        let openMarker = null;

        // Create markers for each property
        const markers = propertiesData.map((property, idx) => {
          const position = {
            lat: parseFloat(property.latitude),
            lng: parseFloat(property.longitude)
          };

          const marker = new google.maps.Marker({
            position,
            map,
            title: property.propertyTitle,
            icon: houseIcon,
            animation: google.maps.Animation.DROP
          });

          // InfoWindow with close button
          const propertyId = property._id;
          const propertyUrl = property.category === 'Off Plan' 
            ? `/off-plan-single/${propertyId}`
            : `/property-details/${propertyId}`;
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="property-popup property-popup-modern" onclick="window.location.href='${propertyUrl}'" style="cursor:pointer;">
                <div class="property-popup-image" style="position:relative;">
                  <img src="${property.propertyFeaturedImage || property.mainImage}" alt="${property.propertyTitle}" style="width:100%;height:100%;object-fit:cover;display:block;" />
                  <div class="property-popup-badge" style="position:absolute;top:14px;left:14px;z-index:10;">${property.category}</div>
                  <button class="property-popup-close" style="position:absolute;top:14px;right:14px;z-index:999;background:#fff;border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.18);cursor:pointer;" onclick="event.stopPropagation();window.closeMapInfoWindow && window.closeMapInfoWindow()">
                    <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#e53e3e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><line x1='18' y1='6' x2='6' y2='18'></line><line x1='6' y1='6' x2='18' y2='18'></line></svg>
                  </button>
                </div>
                <div class="property-popup-body">
                  <div class="property-popup-title">${property.propertyTitle}</div>
                  <div class="property-popup-price">${formatPrice(property.propertyPrice)}</div>
                  <div class="property-popup-location">
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#2563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='margin-right:4px;vertical-align:middle;'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path><circle cx='12' cy='10' r='3'></circle></svg>
                    ${property.propertyAddress}
                  </div>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            // Toggle logic: if already open, close; else open
            if (openInfoWindow && openMarker === marker) {
              openInfoWindow.close();
              openInfoWindow = null;
              openMarker = null;
            } else {
              if (openInfoWindow) openInfoWindow.close();
              infoWindow.open(map, marker);
              openInfoWindow = infoWindow;
              openMarker = marker;
              // Attach close logic to window
              window.closeMapInfoWindow = () => {
                infoWindow.close();
                openInfoWindow = null;
                openMarker = null;
              };
            }
          });

          markersRef.current.push(marker);
          infoWindowsRef.current.push(infoWindow);

          return marker;
        });

        // Custom cluster renderer: always use the red pointer icon, no number
        function setupClusterer() {
          if (!window.markerClusterer) {
            setTimeout(setupClusterer, 100);
            return;
          }
          if (clustererRef.current) {
            clustererRef.current.clearMarkers();
          }
          clustererRef.current = new window.markerClusterer.MarkerClusterer({
            map,
            markers,
            renderer: {
              render: ({ count, position, markers }) => {
                if (count === 1) {
                  return new google.maps.Marker({
                    position,
                    icon: houseIcon,
                    zIndex: Number(google.maps.Marker.MAX_ZINDEX) + 1
                  });
                }
                return new google.maps.Marker({
                  position,
                  icon: redPointerIcon,
                  zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count
                });
              }
            }
          });

          // Add robust cluster click event
          google.maps.event.addListener(clustererRef.current, 'clusterclick', function(event) {
            const cluster = event.cluster;
            const bounds = new google.maps.LatLngBounds();
            cluster.markers.forEach(marker => bounds.extend(marker.getPosition()));
            map.fitBounds(bounds, 80); // 80px padding
          });
        }
        setupClusterer();
      };

      document.head.appendChild(script);
      document.head.appendChild(clustererScript);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (clustererScript.parentNode) {
          clustererScript.parentNode.removeChild(clustererScript);
        }
        delete window.initMapCallback;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Properties</span>
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800">
            {category} Properties Map View
          </h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-white shadow-sm p-4 overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Properties in View
            </h2>
            
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleLocationSelect({
                  coordinates: { lat: property.latitude, lng: property.longitude }
                })}
              >
                <h3 className="font-medium text-gray-800 mb-2">
                  {property.propertyTitle}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {property.propertyAddress}
                </p>
                <p className="text-red-600 font-semibold">
                  {formatPrice(property.propertyPrice)}
                </p>
              </div>
            ))}
          </div>
          
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
                      selectedLocation.lat === loc.coordinates.lat && 
                      selectedLocation.lng === loc.coordinates.lng 
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
    </div>
  );
};

export default MapView;
