/**
 * Map utility functions for the application
 */

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyAb7m_WnewNIpg_xU2_5vhfZmCSD-Y9suU';

/**
 * Generate a Google Maps URL for a location
 * @param {string} address - The address or location name
 * @param {Object} coordinates - The coordinates object with lat and lng
 * @returns {string} The Google Maps URL
 */
export const getGoogleMapsUrl = (address, coordinates) => {
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
  }
  return 'https://www.google.com/maps?q=25.2048,55.2708'; // Dubai
};

/**
 * Generate a Google Maps directions URL
 * @param {number} lat - The latitude
 * @param {number} lng - The longitude
 * @returns {string} The Google Maps directions URL
 */
export const getDirectionsUrl = (lat, lng) => {
  if (!lat || !lng) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

/**
 * Format coordinates for display
 * @param {number} lat - The latitude
 * @param {number} lng - The longitude
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lng) => {
  if (!lat || !lng) return null;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Generate a Google Maps embed URL
 * @param {Object} params - The parameters for the embed URL
 * @param {number} params.latitude - The latitude
 * @param {number} params.longitude - The longitude
 * @param {string} params.address - The address
 * @param {number} params.zoom - The zoom level
 * @returns {string} The Google Maps embed URL
 */
export const getGoogleMapsEmbedUrl = ({ latitude, longitude, address, zoom = 15 }) => {
  if (!latitude || !longitude) return null;
  
  const query = address 
    ? encodeURIComponent(address)
    : `${latitude},${longitude}`;
    
  return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${query}&zoom=${zoom}`;
};

/**
 * Generate a URL for nearby amenities
 * @param {number} lat - The latitude
 * @param {number} lng - The longitude
 * @returns {string} The Google Maps URL for nearby amenities
 */
export const getNearbyAmenitiesUrl = (lat, lng) => {
  if (!lat || !lng) return null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=`;
}; 