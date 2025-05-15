import express from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Check for required environment variables
const requiredEnvVars = [
  { name: 'AWS_REGION', value: process.env.AWS_REGION },
  { name: 'AWS_BUCKET_NAME', value: process.env.AWS_BUCKET_NAME },
  { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
  { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY }
];

const missingVars = requiredEnvVars.filter(v => !v.value);
if (missingVars.length > 0) {
  const missingVarNames = missingVars.map(v => v.name).join(', ');
  console.error(`Missing required environment variables: ${missingVarNames}`);
  console.error('Please check your .env file and ensure all AWS S3 variables are set correctly.');
}

// Use hardcoded values as fallbacks
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'mateluxy-assets';

// Log AWS configuration (without showing full credentials)
console.log('AWS S3 Configuration:', {
  region: AWS_REGION,
  bucketName: AWS_BUCKET_NAME,
  accessKeyConfigured: !!process.env.AWS_ACCESS_KEY_ID,
  secretKeyConfigured: !!process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Helper function to generate a unique filename
const generateUniqueFileName = (originalName) => {
  const timestamp = new Date().getTime();
  const randomString = uuidv4().substring(0, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Route to handle file uploads to S3
 * POST /api/upload-to-s3
 * Requires: multipart/form-data with 'file' field
 * Optional: 'folder' field to specify a folder path in S3
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check if bucket name is available
    const bucketName = process.env.AWS_BUCKET_NAME || 'mateluxy-assets';
    console.log(`Using bucket: ${bucketName}`);

    // Get the folder path from the request body or use default
    const folder = req.body.folder || '';
    
    // Generate a unique filename or use the one provided
    const fileName = req.body.fileName || generateUniqueFileName(req.file.originalname);
    
    // Construct the S3 key (path in the bucket)
    const key = folder ? `${folder}${fileName}` : fileName;
    
    // Set up the S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    console.log('S3 upload parameters:', {
      bucket: bucketName,
      key: key,
      contentType: req.file.mimetype,
      fileSize: req.file.size
    });
    
    // Upload to S3
    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      // Construct the URL for the uploaded file
      const region = process.env.AWS_REGION || 'eu-north-1';
      const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      
      console.log(`File uploaded successfully: ${fileUrl}`);
      
      // Return success response with the file URL
      return res.status(200).json({
        success: true,
        url: fileUrl,
        key: key
      });
    } catch (s3Error) {
      console.error('S3 client error:', s3Error);
      return res.status(500).json({
        success: false,
        message: `S3 upload failed: ${s3Error.message}`,
        code: s3Error.code
      });
    }
    
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to upload file: ${error.message}`
    });
  }
});

export default router;
