import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Use environment variables with fallbacks
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mateluxy-assets';

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Generate a pre-signed URL for an S3 object
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>} The pre-signed URL
 */
export async function getSignedS3Url(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL for key: ${key}`);
  }
}

/**
 * Extract the key from an S3 URL
 * @param {string} url - The S3 URL
 * @returns {string|null} The extracted key or null if not valid
 */
export function extractKeyFromS3Url(url) {
  if (!url) return null;
  
  try {
    // Match standard S3 URL format
    const s3Regex = /https:\/\/[\w-]+\.s3\.[\w-]+\.amazonaws\.com\/(.*)/;
    const match = url.match(s3Regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting key from URL:', error);
    return null;
  }
}

export { s3Client, AWS_BUCKET_NAME }; 