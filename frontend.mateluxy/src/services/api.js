// Simplified API constants with updated domain
const API_URL = `https://backend-mateluxy.onrender.com/api`;

// Ensure property data includes all required fields
const ensureRequiredPropertyFields = (propertyData) => {
  // Define default values for required fields
  const defaults = {
    propertyCountry: "UAE",
    propertyState: "Dubai",
    propertyZip: "00000",
    brokerFee: 0,
    dldQrCode: "https://example.com/qrcode.png",
    agent: "1",
    latitude: 25.2048,
    longitude: 55.2708,
    duringConstructionPercentage: 50,
    onCompletionPercentage: 50,
  };

  // Fill in missing required fields with defaults
  const completeData = { ...defaults };
  
  // Copy all existing data
  for (const key in propertyData) {
    if (propertyData[key] !== undefined && propertyData[key] !== null) {
      completeData[key] = propertyData[key];
    }
  }
  
  // Handle specific fields that need formatting
  if (!completeData.propertyFeaturedImage && 
      propertyData.media && 
      propertyData.media.length > 0) {
    completeData.propertyFeaturedImage = propertyData.media[0];
  }
  
  // Ensure numeric fields are numbers
  ['propertyPrice', 'propertySize', 'propertyRooms', 'propertyBedrooms', 
   'propertyKitchen', 'propertyBathrooms', 'latitude', 'longitude', 'brokerFee',
   'duringConstructionPercentage', 'onCompletionPercentage']
    .forEach(field => {
      if (completeData[field] !== undefined && typeof completeData[field] !== 'number') {
        completeData[field] = Number(completeData[field]) || 0;
      }
    });
  
  return completeData;
};

// Simplified property API with consistent error handling pattern
export const propertyApi = {
  // Get all properties
  getProperties: async () => {
    try {
      const response = await fetch(`${API_URL}/properties`, {
        credentials: 'include', // Add credentials to include cookies for authentication
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch property with id ${id}`);
      return response.json();
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  // Create new property
  createProperty: async (propertyData) => {
    try {
      console.log('Raw property data:', propertyData);
      
      // Ensure all required fields are present
      const completeData = ensureRequiredPropertyFields(propertyData);
      console.log('Complete property data:', completeData);
      
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include credentials for authentication
        body: JSON.stringify(completeData),
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to create property: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If parsing JSON fails, try to get text
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    try {
      const completeData = ensureRequiredPropertyFields(propertyData);
      
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include credentials for authentication
        body: JSON.stringify(completeData),
        mode: 'cors',
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to update property with id ${id}: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        let errorMessage = `Failed to delete property with id ${id}: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  },
};

// Agent API
export const agentApi = {
  getAgents: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
  }
};

// Admin API
export const adminApi = {
  getAdmins: async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch admins: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching admins:', error);
      return [];
    }
  }
};

// Export the base API_URL for convenience
export const apiUrl = API_URL;