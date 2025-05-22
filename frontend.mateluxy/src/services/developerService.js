import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const developerService = {
  /**
   * Get all unique developers from properties
   * @returns {Promise<Array>} Array of developer objects with name and logo
   */
  getDevelopers: async () => {
    try {
      console.log('Fetching developers from API...');
      const response = await axios.get(`${API_URL}/api/properties`);
      
      console.log('API response received:', response.data.length, 'properties');
      
      // Extract unique developers from properties
      const developers = response.data.reduce((acc, property) => {
        // Check for developer and developerImage fields (based on Property.js model)
        if (property.developer && !acc.some(dev => dev.name === property.developer)) {
          acc.push({
            name: property.developer,
            logo: property.developerImage || ''
          });
        }
        return acc;
      }, []);
      
      console.log('Extracted developers:', developers);
      return developers;
    } catch (error) {
      console.error('Error fetching developers:', error);
      return [];
    }
  }
};
