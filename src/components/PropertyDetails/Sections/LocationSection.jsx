import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink, Navigation, Map } from 'lucide-react';
import { 
  getGoogleMapsEmbedUrl, 
  getGoogleMapsUrl, 
  getDirectionsUrl, 
  formatCoordinates,
  getNearbyAmenitiesUrl
} from '../../../utils/mapUtils';

const LocationSection = ({ property }) => {
  // Get location data
  const locationName = property?.propertyAddress || property?.propertyState || 'Location not specified';
  const hasCoordinates = property?.latitude && property?.longitude;
  
  // Get various map URLs using our utility functions
  const googleMapsUrl = getGoogleMapsUrl({
    latitude: property?.latitude,
    longitude: property?.longitude,
    address: locationName
  });
  
  const mapEmbedUrl = getGoogleMapsEmbedUrl({
    latitude: property?.latitude,
    longitude: property?.longitude,
    address: locationName,
    zoom: 15
  });
  
  const directionsUrl = hasCoordinates ? getDirectionsUrl(property.latitude, property.longitude) : null;
  
  // Format coordinates for display
  const formattedCoordinates = hasCoordinates 
    ? formatCoordinates(property.latitude, property.longitude)
    : null;
  
  return (
    <motion.section 
      id="location"
      className="bg-white rounded-2xl shadow-sm overflow-hidden p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="text-red-500" size={24} />
          Location
        </h2>
        
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <MapPin className="text-red-500" size={18} />
          <span className="text-gray-700">{locationName}</span>
        </div>
      </div>
      
      {/* Location Details */}
      {hasCoordinates && (
        <div className="mb-4 flex items-center justify-end">
          <div className="bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-700 flex items-center">
            <Navigation className="h-4 w-4 mr-2 text-red-500" />
            <span className="font-mono">{formattedCoordinates}</span>
          </div>
        </div>
      )}
      
      {/* Map */}
      <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 h-[400px]">
        {mapEmbedUrl ? (
          <div className="relative h-full">
            <iframe 
              src={mapEmbedUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Property Location"
              className="absolute inset-0"
            />
           
            <div className="absolute bottom-4 right-4 flex gap-2">
              <a 
                href={googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10 flex items-center justify-center"
                title="Open in Google Maps"
              >
                <ExternalLink size={20} className="text-gray-700" />
              </a>
              {directionsUrl && (
                <a 
                  href={directionsUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-red-600 p-3 rounded-full shadow-md hover:bg-red-700 transition-colors z-10 flex items-center justify-center"
                  title="Get Directions"
                >
                  <Navigation size={20} className="text-white" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Map location not available</p>
          </div>
        )}
      </div>
      
      {/* Neighborhood Description */}
      {property?.neighborhoodDescription && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">About the Neighborhood</h3>
          <p className="text-gray-700">
            {property.neighborhoodDescription}
          </p>
        </div>
      )}
      
      {/* If no neighborhood description is available */}
      {!property?.neighborhoodDescription && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">About the Neighborhood</h3>
          <p className="text-gray-700">
            This property is located in {locationName}, offering convenient access to various amenities and facilities. 
            The neighborhood provides a blend of urban convenience and comfortable living with proximity to essential services.
          </p>
          {hasCoordinates && (
            <div className="mt-4 flex">
              <a 
                href={getNearbyAmenitiesUrl(property.latitude, property.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
              >
                <span>Explore nearby amenities</span>
                <ExternalLink size={14} className="ml-1" />
              </a>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
};

export default LocationSection;
