/**
 * Utility functions to convert between S3 URLs and proxy URLs
 */

/**
 * Checks if a URL needs conversion to a proxy URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL needs conversion
 */
export const needsProxyConversion = (url) => {
  if (!url) return false;
  
  // Skip URLs that are already proxied
  if (url.includes('/api/s3-proxy')) return false;
  
  // Skip data URLs
  if (url.startsWith('data:')) return false;

  // Check if it's an S3 URL
  const isS3Url = url.includes('s3.') && url.includes('amazonaws.com');
  
  // Check if it's a URL to our own API domain but NOT a proxy URL
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const isOurApiButNotProxy = apiUrl && 
    url.startsWith(apiUrl) && 
    !url.includes('/api/s3-proxy');
  
  return isS3Url || isOurApiButNotProxy;
};

/**
 * Converts an S3 URL to a proxied URL that can be accessed by the frontend
 * @param {string} s3Url - The original S3 URL
 * @param {Object} options - Additional options
 * @param {boolean} options.useSignedUrl - Whether to use a signed URL (more secure, but temporary)
 * @param {boolean} options.isVCard - Whether this is a vCard URL (special handling)
 * @returns {string} - The proxied URL
 */
export const convertS3UrlToProxyUrl = (s3Url, options = {}) => {
  if (!s3Url) return '';
  
  // Check if conversion is needed
  if (!needsProxyConversion(s3Url)) {
    return s3Url;
  }
  
  try {
    // Special handling for vCards
    if (options.isVCard) {
      // If it's a vCard URL, use the special vCard route
      if (s3Url.includes('/vcards/')) {
        const filename = s3Url.split('/').pop();
        return `${import.meta.env.VITE_API_URL}/api/s3-proxy/vcard/${filename}`;
      }
    }
    
    // If it's an S3 URL, extract the key
    if (s3Url.includes('s3.') && s3Url.includes('amazonaws.com')) {
      const url = new URL(s3Url);
      
      // Extract the key by removing the domain part
      let key = url.pathname;
      
      // Remove the leading slash if present
      if (key.startsWith('/')) {
        key = key.substring(1);
      }
      
      // Check if the pathname includes the bucket name and remove it if needed
      // This handles URLs from both virtual-hosted and path-style S3 endpoints
      const bucketName = import.meta.env.VITE_AWS_BUCKET_NAME || 'mateluxy-assets';
      if (key.startsWith(bucketName + '/')) {
        key = key.substring(bucketName.length + 1);
      }
      
      // Use a signed URL if requested
      if (options.useSignedUrl) {
        return `${import.meta.env.VITE_API_URL}/api/s3-proxy/signed-url?key=${encodeURIComponent(key)}`;
      }
      
      // Otherwise use the direct-key endpoint with a query parameter
      return `${import.meta.env.VITE_API_URL}/api/s3-proxy/direct-key?key=${encodeURIComponent(key)}`;
    }
    
    // If we get this far, just return the original URL
    return s3Url;
  } catch (error) {
    console.error('Error converting S3 URL to proxy URL:', error, 'URL:', s3Url);
    return s3Url; // Return original URL if there's an error
  }
};

/**
 * Gets a signed URL for a given S3 URL
 * @param {string} s3Url - The original S3 URL
 * @returns {Promise<string>} - A promise that resolves to the signed URL
 */
export const getSignedUrl = async (s3Url) => {
  if (!s3Url) return '';
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/s3-proxy/signed-url?url=${encodeURIComponent(s3Url)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.signedUrl) {
      return data.signedUrl;
    } else {
      throw new Error(data.error || 'Failed to get signed URL');
    }
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return s3Url; // Return original URL if there's an error
  }
};

/**
 * Checks if a URL is an S3 URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's an S3 URL, false otherwise
 */
export const isS3Url = (url) => {
  if (!url) return false;
  return url.includes('s3.') && url.includes('amazonaws.com');
};

/**
 * Converts all S3 URLs in an object to proxy URLs
 * @param {Object} obj - The object containing S3 URLs
 * @param {Object} options - Additional options for conversion
 * @returns {Object} - The object with converted URLs
 */
export const convertObjectS3UrlsToProxyUrls = (obj, options = {}) => {
  if (!obj) return obj;
  
  const newObj = { ...obj };
  
  // Process each property in the object
  Object.keys(newObj).forEach(key => {
    const value = newObj[key];
    
    // Special handling for vCard field
    const isVCard = key === 'vcard';
    const fieldOptions = { ...options, isVCard };
    
    // If the value is a string and looks like an S3 URL
    if (typeof value === 'string' && needsProxyConversion(value)) {
      newObj[key] = convertS3UrlToProxyUrl(value, fieldOptions);
    }
    // If the value is an array, process each item
    else if (Array.isArray(value)) {
      newObj[key] = value.map(item => {
        // If the item is a string and looks like an S3 URL
        if (typeof item === 'string' && needsProxyConversion(item)) {
          return convertS3UrlToProxyUrl(item, fieldOptions);
        }
        // If the item is an object, recursively process it
        else if (typeof item === 'object' && item !== null) {
          return convertObjectS3UrlsToProxyUrls(item, fieldOptions);
        }
        return item;
      });
    }
    // If the value is an object, recursively process it
    else if (typeof value === 'object' && value !== null) {
      newObj[key] = convertObjectS3UrlsToProxyUrls(value, fieldOptions);
    }
  });
  
  return newObj;
};
