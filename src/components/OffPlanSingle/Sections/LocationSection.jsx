import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const LocationSection = ({ property }) => {
  // Default map location (Dubai) if property doesn't have coordinates
  const defaultLocation = { lat: 25.2048, lng: 55.2708 };
  
  // Get property location or default
  const location = property?.location || defaultLocation;
  
  // Generate OpenStreetMap URL
  const getOpenStreetMapUrl = () => {
    if (property?.propertyAddress) {
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(property.propertyAddress)}`;
    }
    if (location) {
      return `https://www.openstreetmap.org/#map=15/${location.lat}/${location.lng}`;
    }
    return `https://www.openstreetmap.org/#map=12/25.2048/55.2708`; // Dubai
  };

  return (
    <section className="bg-white rounded-[30px] border border-[#e6e6e6] overflow-hidden mb-8 p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Location</h2>
      
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-4">
          <MapPin className="text-red-500 mt-1" size={20} />
          <p className="text-gray-700">
            {property?.propertyAddress || property?.propertyState || 'Location details not available'}
          </p>
        </div>
        
        <a 
          href={getOpenStreetMapUrl()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-red-500 font-medium hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <ExternalLink size={16} />
          View on OpenStreetMap
        </a>
      </div>
      
      <div className="rounded-xl overflow-hidden h-[400px] border border-red-200">
        <iframe 
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${property?.propertyLongitude || 55.2708 - 0.1},${property?.propertyLatitude || 25.2048 - 0.1},${property?.propertyLongitude || 55.2708 + 0.1},${property?.propertyLatitude || 25.2048 + 0.1}&layer=mapnik&marker=${property?.propertyLatitude || 25.2048},${property?.propertyLongitude || 55.2708}`}
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
};

export default LocationSection;