import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Log all environment variables (without showing full secrets)
console.log('Environment variables:');
console.log('- AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('- AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME || 'NOT SET');
console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Test S3 connection
async function testS3Connection() {
  try {
    console.log('Testing S3 connection...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('S3 connection successful!');
    console.log('Available buckets:');
    response.Buckets.forEach(bucket => {
      console.log(`- ${bucket.Name} (created: ${bucket.CreationDate})`);
      if (bucket.Name === process.env.AWS_BUCKET_NAME) {
        console.log(`  ✅ Found your target bucket: ${bucket.Name}`);
      }
    });
    
    if (!response.Buckets.some(b => b.Name === process.env.AWS_BUCKET_NAME)) {
      console.log(`⚠️ Your target bucket "${process.env.AWS_BUCKET_NAME}" was not found in the list of available buckets.`);
    }
    
  } catch (error) {
    console.error('Error testing S3 connection:', error);
  }
}

// Run the test
testS3Connection();
