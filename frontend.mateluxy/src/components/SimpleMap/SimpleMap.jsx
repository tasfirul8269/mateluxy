import React, { useEffect, useRef } from 'react';
import { getGoogleMapsEmbedUrl } from '../../utils/mapUtils';

const SimpleMap = ({ latitude, longitude, onCoordinateChange }) => {
  const mapRef = useRef(null);
  
  // Handle default or invalid coordinates
  const validLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 25.2048;
  const validLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : 55.2708;

  useEffect(() => {
    const mapEmbedUrl = getGoogleMapsEmbedUrl({
      latitude: validLat,
      longitude: validLng,
      zoom: 13
    });

    if (mapRef.current) {
      const iframe = document.createElement('iframe');
      iframe.src = mapEmbedUrl;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = '0';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.title = 'Property Location';

      // Clear previous content
      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(iframe);
    }
  }, [validLat, validLng]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default SimpleMap;