import express from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import { s3Client, AWS_BUCKET_NAME, getSignedS3Url, extractKeyFromS3Url } from '../utils/s3Helpers.js';

dotenv.config();

const router = express.Router();

// Log S3 configuration
console.log('S3 Proxy initialized with:', {
  region: process.env.AWS_REGION || 'eu-north-1',
  bucketName: AWS_BUCKET_NAME,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
});

/**
 * Route to generate signed URLs for S3 objects
 * GET /api/s3-proxy/signed-url
 * Query parameter: key - the full S3 key path or original s3 URL
 */
router.get('/signed-url', async (req, res) => {
  try {
    // Get the key from query parameter
    let key = req.query.key;
    const url = req.query.url;
    
    // If URL is provided instead of key, extract key from URL
    if (!key && url) {
      key = extractKeyFromS3Url(url);
    }
    
    if (!key) {
      return res.status(400).json({ 
        error: 'Missing key or url parameter',
        success: false
      });
    }
    
    console.log(`Generating signed URL for key: ${key}`);
    
    // Generate signed URL
    try {
      const signedUrl = await getSignedS3Url(key);
      return res.status(200).json({
        success: true,
        signedUrl
      });
    } catch (s3Error) {
      console.error('S3 error generating signed URL:', {
        error: s3Error.message,
        code: s3Error.code,
        bucket: AWS_BUCKET_NAME,
        key
      });
      return res.status(404).json({
        success: false,
        error: `Failed to generate signed URL: ${s3Error.message}`
      });
    }
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing signed URL request'
    });
  }
});

/**
 * Route to proxy S3 images with a direct key path
 * GET /api/s3-proxy/direct-key
 * Query parameter: key - the full S3 key path
 */
router.get('/direct-key', async (req, res) => {
  try {
    // Get the key from query parameter
    const key = req.query.key;
    
    if (!key) {
      return res.status(400).send('Missing key parameter');
    }
    
    console.log(`Proxying S3 object with key: ${key}`);
    
    // Set up the S3 get object parameters
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    };

    // Get the object from S3
    try {
      const command = new GetObjectCommand(params);
      const s3Response = await s3Client.send(command);
      
      // Set appropriate headers
      if (s3Response.ContentType) {
        res.setHeader('Content-Type', s3Response.ContentType);
      }
      if (s3Response.ContentLength) {
        res.setHeader('Content-Length', s3Response.ContentLength);
      }
      
      // Add cache-control header for better performance
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      
      // Stream the S3 object to the response
      if (s3Response.Body instanceof Readable) {
        s3Response.Body.pipe(res);
      } else {
        // If Body is not a stream, convert it to a buffer and send
        const responseBuffer = await s3Response.Body.transformToByteArray();
        res.send(Buffer.from(responseBuffer));
      }
    } catch (s3Error) {
      console.error('S3 error fetching object:', {
        error: s3Error.message,
        code: s3Error.code,
        bucket: AWS_BUCKET_NAME,
        key
      });
      
      // Try to generate a signed URL as fallback
      try {
        const signedUrl = await getSignedS3Url(key);
        return res.redirect(signedUrl);
      } catch (signedError) {
        return res.status(404).send(`Object not found: ${s3Error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error proxying S3 object:', error);
    res.status(500).send('Server error processing object request');
  }
});

/**
 * Route specifically for vCard files
 * GET /api/s3-proxy/vcard/:filename
 */
router.get('/vcard/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const key = `vcards/${filename}`;
    
    console.log(`Serving vCard: ${key}`);
    
    // Try to get the vCard directly first
    try {
      const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: key,
      });
      
      const s3Response = await s3Client.send(command);
      
      // Set appropriate headers for file download
      if (s3Response.ContentType) {
        res.setHeader('Content-Type', s3Response.ContentType);
      }
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Stream the vCard to the response
      if (s3Response.Body instanceof Readable) {
        s3Response.Body.pipe(res);
      } else {
        const responseBuffer = await s3Response.Body.transformToByteArray();
        res.send(Buffer.from(responseBuffer));
      }
    } catch (s3Error) {
      // If direct access fails, try to redirect to a signed URL
      try {
        const signedUrl = await getSignedS3Url(key);
        return res.redirect(signedUrl);
      } catch (signedError) {
        return res.status(404).send(`vCard not found: ${s3Error.message}`);
      }
    }
  } catch (error) {
    console.error('Error serving vCard:', error);
    res.status(500).send('Server error processing vCard request');
  }
});

/**
 * Route to proxy S3 images
 * GET /api/s3-proxy/:folder/:filename
 * Example: /api/s3-proxy/admins/1747281671192-afccf2m6rxj.png
 */
router.get('/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const key = `${folder}/${filename}`;
    
    console.log(`Proxying S3 image: ${key}`);
    
    // Set up the S3 get object parameters
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
    };

    // Get the object from S3
    try {
      const command = new GetObjectCommand(params);
      const s3Response = await s3Client.send(command);
      
      // Set appropriate headers
      if (s3Response.ContentType) {
        res.setHeader('Content-Type', s3Response.ContentType);
      }
      if (s3Response.ContentLength) {
        res.setHeader('Content-Length', s3Response.ContentLength);
      }
      
      // Add cache-control header for better performance
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      
      // Stream the S3 object to the response
      if (s3Response.Body instanceof Readable) {
        s3Response.Body.pipe(res);
      } else {
        // If Body is not a stream, convert it to a buffer and send
        const responseBuffer = await s3Response.Body.transformToByteArray();
        res.send(Buffer.from(responseBuffer));
      }
    } catch (s3Error) {
      console.error('S3 error fetching object:', {
        error: s3Error.message,
        code: s3Error.code,
        bucket: AWS_BUCKET_NAME,
        key
      });
      
      // Try to generate a signed URL as fallback
      try {
        const signedUrl = await getSignedS3Url(key);
        return res.redirect(signedUrl);
      } catch (signedError) {
        return res.status(404).send(`Image not found: ${s3Error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error proxying S3 image:', error);
    res.status(500).send('Server error processing image request');
  }
});

export default router;
