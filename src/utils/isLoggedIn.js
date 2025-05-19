// frontend/src/utils/isLoggedIn.js
export const isLoggedIn = async () => {
    try {
      // Use a cache-busting param to avoid browser caching the response
      const cacheBuster = new Date().getTime();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/check-auth?t=${cacheBuster}`, {
        method: 'GET',
        credentials: 'include', // Very important to send cookies
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
  
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error("Authentication check failed:", err);
      return false;
    }
  };
  
// Function to explicitly logout the user
export const logout = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.ok;
  } catch (err) {
    console.error("Logout failed:", err);
      return false;
    }
  };
  