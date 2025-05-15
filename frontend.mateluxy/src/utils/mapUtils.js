/**
 * Map utility functions for the application
 */

// The Google Maps API key should ideally come from environment variables
// For now, we're centralizing it here to make it easier to update
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

/**
 * Generate a Google Maps embed URL based on coordinates or address
 * @param {Object} params - Parameters for the map
 * @param {number} params.latitude - Latitude coordinate 
 * @param {number} params.longitude - Longitude coordinate
 * @param {string} params.address - Address string as fallback
 * @param {number} params.zoom - Zoom level (1-20)
 * @returns {string} The Google Maps embed URL
 */
export const getGoogleMapsEmbedUrl = ({ latitude, longitude, address, zoom = 15 }) => {
  // If we have coordinates, use them for precise location
  if (latitude && longitude) {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&center=${latitude},${longitude}&zoom=${zoom}&maptype=roadmap`;
  }
  
  // Otherwise use the address for geocoding
  if (address) {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`;
  }
  
  // Return null if we don't have enough information
  return null;
};

/**
 * Generate a direct Google Maps URL for opening in new tab
 * @param {Object} params - Parameters for the map
 * @param {number} params.latitude - Latitude coordinate
 * @param {number} params.longitude - Longitude coordinate
 * @param {string} params.address - Address string as fallback
 * @returns {string} The Google Maps URL
 */
export const getGoogleMapsUrl = ({ latitude, longitude, address }) => {
  // If we have coordinates, use them for precise location
  if (latitude && longitude) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
  
  // Otherwise use the address for geocoding
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  
  // Return null if we don't have enough information
  return null;
};

/**
 * Generate a directions URL to the location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {string} The Google Maps directions URL
 */
export const getDirectionsUrl = (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
};

/**
 * Format coordinates to a human-readable string
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} precision - Number of decimal places (default: 6)
 * @returns {string} Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude, precision = 6) => {
  if (!latitude || !longitude) return null;
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
};

/**
 * Generate a URL to search for nearby amenities
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} amenityType - Type of amenity to search for (optional)
 * @returns {string} The Google Maps search URL
 */
export const getNearbyAmenitiesUrl = (latitude, longitude, amenityType = 'nearby+amenities') => {
  if (!latitude || !longitude) return null;
  return `https://www.google.com/maps/search/${encodeURIComponent(amenityType)}/@${latitude},${longitude},15z`;
}; 