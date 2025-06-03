import React, { useEffect, useRef } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { getGoogleMapsUrl, getDirectionsUrl } from '../../utils/mapUtils';

const LocationSection = ({ property }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Default map location (Dubai) if property doesn't have coordinates
  const defaultLocation = { lat: 25.2048, lng: 55.2708 };
  
  // Get property location or default
  const location = {
    lat: property?.latitude || property?.propertyLatitude || defaultLocation.lat,
    lng: property?.longitude || property?.propertyLongitude || defaultLocation.lng
  };

  // Get location name
  const locationName = property?.propertyAddress || property?.propertyState || 'Location not specified';

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      if (!mapContainer.current || !isMounted) return;

      try {
        // Load Google Maps JavaScript API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAb7m_WnewNIpg_xU2_5vhfZmCSD-Y9suU&callback=initMapCallback`;
        script.async = true;
        script.defer = true;

        // Define the callback function
        window.initMapCallback = () => {
          if (!mapContainer.current || !isMounted) return;

          // Create map instance
          const map = new google.maps.Map(mapContainer.current, {
            center: location,
            zoom: 15,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });

          // Create marker
          const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: property?.propertyTitle || 'Property Location',
            animation: google.maps.Animation.DROP
          });

          // Store references
          mapRef.current = map;
          markerRef.current = marker;

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${property?.propertyTitle || 'Property Location'}</h3>
                <p class="text-sm text-gray-600">${locationName}</p>
              </div>
            `
          });

          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        };

        // Add script to document
        document.head.appendChild(script);

        // Cleanup function
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
          delete window.initMapCallback;
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Initialize map
    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, [location, property?.propertyTitle, locationName]);

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Location</h2>
      
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-4">
          <MapPin className="text-red-500 mt-1" size={20} />
          <p className="text-gray-700">
            {locationName}
          </p>
        </div>
        
        <a 
          href={getGoogleMapsUrl(locationName, location)}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-red-500 font-medium hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <ExternalLink size={16} />
          View on Google Maps
        </a>
      </div>
      
      <div className="rounded-xl overflow-hidden h-[400px] border border-red-200">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </section>
  );
};

export default LocationSection; 