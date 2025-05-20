// Ensure the API URL includes the /api prefix
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Get all news
export const getAllNews = async (params = {}) => {
  try {
    const { category, featured, limit } = params;
    let url = `${API_URL}/news`;
    
    // Add query parameters if provided
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (featured !== undefined) queryParams.append('featured', featured);
    if (limit) queryParams.append('limit', limit);
    
    // Append query parameters to URL if any exist
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url, { 
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
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Get news by ID
export const getNewsById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/news/id/${id}`, {
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
    console.error('Error fetching news by ID:', error);
    throw error;
  }
};

// Get news by slug
export const getNewsBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/news/slug/${slug}`, {
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
    console.error('Error fetching news by slug:', error);
    throw error;
  }
};

// Create news (admin only)
export const createNews = async (newsData) => {
  try {
    const response = await fetch(`${API_URL}/news`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newsData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

// Update news (admin only)
export const updateNews = async (id, newsData) => {
  try {
    const response = await fetch(`${API_URL}/news/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newsData)
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

// Delete news (admin only)
export const deleteNews = async (id) => {
  try {
    const response = await fetch(`${API_URL}/news/${id}`, {
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
    console.error('Error deleting news:', error);
    throw error;
  }
}; 