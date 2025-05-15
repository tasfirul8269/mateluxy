/**
 * AWS S3 Direct Upload Utility
 * This utility provides functions for uploading files directly to AWS S3 from the browser
 * using a simple approach that doesn't rely on the AWS SDK.
 */

// Check if all required environment variables are present
const checkRequiredEnvVars = () => {
  const requiredVars = [
    { name: 'VITE_AWS_REGION', value: import.meta.env.VITE_AWS_REGION },
    { name: 'VITE_AWS_BUCKET_NAME', value: import.meta.env.VITE_AWS_BUCKET_NAME },
    { name: 'VITE_AWS_ACCESS_KEY_ID', value: import.meta.env.VITE_AWS_ACCESS_KEY_ID },
    { name: 'VITE_AWS_SECRET_ACCESS_KEY', value: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY }
  ];

  const missingVars = requiredVars.filter(v => !v.value);
  if (missingVars.length > 0) {
    const missingVarNames = missingVars.map(v => v.name).join(', ');
    console.error(`Missing required environment variables: ${missingVarNames}`);
    console.error('Please check your .env file and ensure all AWS S3 variables are set correctly.');
    console.error(`Required values:
- VITE_AWS_REGION: The AWS region where your bucket is located (e.g., eu-north-1)
- VITE_AWS_BUCKET_NAME: Your S3 bucket name (e.g., mateluxy-assets)
- VITE_AWS_ACCESS_KEY_ID: Your AWS access key ID
- VITE_AWS_SECRET_ACCESS_KEY: Your AWS secret access key`);
    return false;
  }
  
  // Log the configured values (without showing the full secret key)
  console.log('AWS S3 Configuration:', {
    region: import.meta.env.VITE_AWS_REGION,
    bucketName: import.meta.env.VITE_AWS_BUCKET_NAME,
    accessKeyConfigured: !!import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretKeyConfigured: !!import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
  });
  
  return true;
};

// Generate a unique file name to avoid collisions in S3 bucket
const generateUniqueFileName = (originalName) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Create an AWS signature for direct S3 upload
 * This is a simplified version that works in browsers without requiring the AWS SDK
 */
const createSignature = (stringToSign, secretKey) => {
  // This is a simplified implementation and should be replaced with a proper HMAC-SHA256 implementation
  // For production, you should use a library like crypto-js or implement this on the server side
  
  // For now, we'll use a simple base64 encoding as a placeholder
  // In a real implementation, you would use:  
  // CryptoJS.HmacSHA256(stringToSign, secretKey).toString(CryptoJS.enc.Base64)
  
  // Since we can't properly sign requests in the browser without exposing credentials,
  // we'll make the bucket publicly writable for now and use a simple direct upload
  return 'signature-placeholder';
};

/**
 * Upload a single file to AWS S3 using a proxy server approach
 * @param {File} file - The file to upload
 * @param {string} folder - Optional folder path within the bucket (e.g., 'properties/images/')
 * @returns {Promise<string>} - URL of the uploaded file
 */
export const uploadFileToS3 = async (file, folder = '') => {
  try {
    console.log(`Starting S3 upload for file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Check if all required environment variables are present
    if (!checkRequiredEnvVars()) {
      throw new Error('Missing required AWS S3 configuration. Check the console for details.');
    }
    
    // Basic file validation
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object provided for upload');
    }
    
    if (file.size === 0) {
      throw new Error('Cannot upload empty file');
    }
    
    // Generate a unique file name
    const fileName = generateUniqueFileName(file.name);
    const key = folder ? `${folder}${fileName}` : fileName;
    
    // Create form data for the upload
    const formData = new FormData();
    
    // Add the file and metadata
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('fileName', fileName);
    formData.append('contentType', file.type);
    
    console.log('Uploading to S3 via backend proxy:', {
      fileName,
      folder,
      contentType: file.type,
      fileSize: file.size
    });
    
    // Use the backend API to handle the S3 upload
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('API URL not configured in environment variables');
    }
    
    const uploadUrl = `${apiUrl}/api/upload-to-s3`;
    console.log(`Sending upload request to: ${uploadUrl}`);
    
    // Upload the file to the backend proxy
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication if needed
      });
      
      if (!response.ok) {
        let errorData = {};
        try {
          // Try to parse error as JSON
          errorData = await response.json();
        } catch (parseError) {
          // If not JSON, get error as text
          const errorText = await response.text();
          console.error('S3 upload error response (text):', errorText);
          throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
        }
        
        console.error('S3 upload error response (JSON):', errorData);
        throw new Error(errorData.message || `Upload failed: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response to get the S3 URL
      const data = await response.json();
      console.log('File uploaded successfully. S3 path:', data.url);
      
      // Return just the URL
      return data.url;
    } catch (fetchError) {
      console.error('Network or fetch error during S3 upload:', fetchError);
      throw new Error(`Network error during upload: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Upload multiple files to AWS S3
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<string[]>} - Array of URLs of the uploaded files
 */
export const uploadMultipleFilesToS3 = async (files, folder = '') => {
  try {
    // Check if all required environment variables are present
    if (!checkRequiredEnvVars()) {
      throw new Error('Missing required AWS S3 configuration. Check the console for details.');
    }
    
    // Process each file upload individually
    const uploadPromises = files.map(file => uploadFileToS3(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files to S3:', error);
    throw error;
  }
};

/**
 * Convert a base64 string to a File object for upload
 * @param {string} base64String - Base64 encoded string (with or without data URL prefix)
 * @param {string} filename - Desired filename
 * @returns {File} - File object ready for upload
 */
export const base64ToFile = (base64String, filename = 'image.png') => {
  // Extract the base64 data if it includes the data URL prefix
  let base64Data = base64String;
  let contentType = 'image/png'; // Default content type
  
  if (base64String.includes('data:')) {
    // Extract content type and base64 data from the data URL
    const parts = base64String.split(';base64,');
    contentType = parts[0].replace('data:', '');
    base64Data = parts[1];
  }
  
  // Decode base64 string
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  const blob = new Blob(byteArrays, { type: contentType });
  
  // Get file extension from content type
  const extension = contentType.split('/')[1] || 'png';
  const filenameFinal = filename.includes('.') ? filename : `${filename}.${extension}`;
  
  return new File([blob], filenameFinal, { type: contentType });
};

/**
 * Upload a base64 image directly to S3
 * @param {string} base64String - Base64 encoded string (with or without data URL prefix)
 * @param {string} folder - Optional folder path within the bucket
 * @returns {Promise<string>} - URL of the uploaded file
 */
export const uploadBase64ToS3 = async (base64String, folder = '') => {
  try {
    if (!base64String) {
      throw new Error('No base64 string provided');
    }
    
    // Convert base64 to file
    const file = base64ToFile(base64String);
    
    // Upload the file to S3
    return await uploadFileToS3(file, folder);
  } catch (error) {
    console.error('Error uploading base64 image to S3:', error);
    throw error;
  }
};
