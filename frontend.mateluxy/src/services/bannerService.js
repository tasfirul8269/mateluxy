// Ensure the API URL includes the /api prefix
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Get all banners
export const getAllBanners = async () => {
  try {
    const response = await fetch(`${API_URL}/banners`, { 
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};

// Get banners by type (home or offplan)
export const getBannersByType = async (type) => {
  try {
    const response = await fetch(`${API_URL}/banners?type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type} banners:`, error);
    throw error;
  }
};

// Get a single banner
export const getBanner = async (id) => {
  try {
    const response = await fetch(`${API_URL}/banners/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching banner:', error);
    throw error;
  }
};

// Create a new banner
export const createBanner = async (bannerData) => {
  try {
    const response = await fetch(`${API_URL}/banners`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bannerData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating banner:', error);
    throw error;
  }
};

// Update a banner
export const updateBanner = async (id, bannerData) => {
  try {
    const response = await fetch(`${API_URL}/banners/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bannerData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
};

// Delete a banner
export const deleteBanner = async (id) => {
  try {
    const response = await fetch(`${API_URL}/banners/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
};
