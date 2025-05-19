/**
 * Utility for tracking admin activity and updating online status
 */

// Track activity events
let activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
let activityTimeout;
let lastActivityUpdate = 0;
const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize activity tracking for the current user
 * @param {string} adminId - The ID of the current admin
 */
export const initActivityTracking = (adminId) => {
  if (!adminId) return;
  
  // Update activity on initial load
  updateAdminActivity(adminId);
  
  // Set up event listeners for user activity
  activityEvents.forEach(event => {
    window.addEventListener(event, () => {
      handleUserActivity(adminId);
    });
  });
  
  // Set up interval to check for inactivity
  activityTimeout = setInterval(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastActivityUpdate;
    
    // If it's been more than the interval since last update, update again
    if (timeSinceLastUpdate >= ACTIVITY_UPDATE_INTERVAL) {
      updateAdminActivity(adminId);
    }
  }, ACTIVITY_UPDATE_INTERVAL);
  
  // Set up event listener for page unload
  window.addEventListener('beforeunload', () => {
    // Set user offline when they close the page
    setAdminOffline(adminId);
    clearInterval(activityTimeout);
  });
};

/**
 * Handle user activity event
 */
const handleUserActivity = (adminId) => {
  const now = Date.now();
  const timeSinceLastUpdate = now - lastActivityUpdate;
  
  // Only update activity status every 5 minutes to avoid excessive API calls
  if (timeSinceLastUpdate >= ACTIVITY_UPDATE_INTERVAL) {
    updateAdminActivity(adminId);
  }
};

/**
 * Update admin activity status on the server
 */
const updateAdminActivity = async (adminId) => {
  try {
    lastActivityUpdate = Date.now();
    await fetch(`${import.meta.env.VITE_API_URL}/api/${adminId}/activity`, {
      method: 'PUT',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Failed to update activity status:', error);
  }
};

/**
 * Set admin status to offline
 */
const setAdminOffline = async (adminId) => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/api/${adminId}/offline`, {
      method: 'PUT',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Failed to set offline status:', error);
  }
};

/**
 * Clean up activity tracking
 */
export const cleanupActivityTracking = (adminId) => {
  // Remove event listeners
  activityEvents.forEach(event => {
    window.removeEventListener(event, () => handleUserActivity(adminId));
  });
  
  // Clear interval
  if (activityTimeout) {
    clearInterval(activityTimeout);
  }
  
  // Set user offline
  if (adminId) {
    setAdminOffline(adminId);
  }
}; 