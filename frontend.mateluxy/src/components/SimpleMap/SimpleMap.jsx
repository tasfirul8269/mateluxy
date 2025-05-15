import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';

// Fix marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map view updates when props change
function MapUpdater({ center, onClick }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && 
        center[0] !== undefined && center[1] !== undefined &&
        !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  // Add click handler
  useEffect(() => {
    if (!onClick) return;
    
    // Add click event
    const handleClick = (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    
    // Clean up
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);
  
  return null;
}

function SimpleMap({ latitude, longitude, onCoordinateChange }) {
  // Handle default or invalid coordinates
  const validLat = latitude && !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 25.2048;
  const validLng = longitude && !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : 55.2708;
  const position = [validLat, validLng]; // Use Dubai coordinates as default

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Property Location <br /> Latitude: {validLat.toFixed(6)}, Longitude: {validLng.toFixed(6)}
          </Popup>
        </Marker>
        <MapUpdater 
          center={position} 
          onClick={onCoordinateChange}
        />
      </MapContainer>
    </div>
  );
}

export default SimpleMap;