# AWS S3 Migration Guide

## Overview

This document outlines the migration from Cloudinary to AWS S3 for file uploads in the MateLuxy project. All property-related file uploads (featured images, media galleries, developer logos, brochures, etc.) now use AWS S3 instead of Cloudinary.

## Changes Made

1. Added AWS SDK packages:
   - `@aws-sdk/client-s3`
   - `@aws-sdk/s3-request-presigner`

2. Created a new utility file for S3 uploads:
   - `frontend.mateluxy/src/utils/s3Upload.js`

3. Updated all upload handlers in `TabbedPropertyForm.jsx` to use S3 instead of Cloudinary

4. Updated environment variables to include AWS S3 configuration

## Environment Variables

Add the following environment variables to your `.env` file:

```
# AWS S3 Config
VITE_AWS_REGION=your_aws_region
VITE_AWS_BUCKET_NAME=your_s3_bucket_name
VITE_AWS_ACCESS_KEY_ID=your_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

## AWS S3 Setup

1. **Create an S3 Bucket**:
   - Go to the AWS Management Console
   - Navigate to S3
   - Create a new bucket with a unique name
   - Configure bucket settings (public access, CORS, etc.)

2. **Set Up CORS Configuration**:
   Add the following CORS configuration to your S3 bucket to allow uploads from your frontend domain:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["https://yourdomain.com", "http://localhost:5173"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User**:
   - Create a new IAM user with programmatic access
   - Attach the `AmazonS3FullAccess` policy (or create a custom policy with more restricted permissions)
   - Save the access key ID and secret access key for use in your environment variables

## Folder Structure

Files are organized in the following folder structure within your S3 bucket:

- `properties/featured/` - Featured property images
- `properties/media/` - Property media galleries
- `properties/qr/` - DLD QR codes
- `properties/developer/` - Developer logos
- `properties/brochures/` - Property brochures
- `properties/locations/` - Location images
- `properties/exterior/` - Exterior gallery images
- `properties/interior/` - Interior gallery images

## Security Considerations

1. Never commit your AWS credentials to version control
2. Consider using IAM roles and temporary credentials for production
3. Implement server-side validation of file types and sizes
4. Set up proper bucket policies to restrict access as needed

## Rollback Plan

If you need to revert to Cloudinary:

1. Keep the Cloudinary environment variables in your `.env` file
2. Revert the changes in `TabbedPropertyForm.jsx` to use Cloudinary upload handlers
3. Remove the S3 utility file if no longer needed
