import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const developerService = {
  /**
   * Get all unique developers from properties
   * @returns {Promise<Array>} Array of developer objects with name and logo
   */
  getDevelopers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/properties`, {
        params: {
          category: 'Off Plan',
          limit: 100
        }
      });
      
      // Extract unique developers from properties
      const developers = response.data.reduce((acc, property) => {
        if (property.developerName && !acc.some(dev => dev.name === property.developerName)) {
          acc.push({
            name: property.developerName,
            logo: property.developerImage || ''
          });
        }
        return acc;
      }, []);
      
      return developers;
    } catch (error) {
      console.error('Error fetching developers:', error);
      return [];
    }
  }
};
