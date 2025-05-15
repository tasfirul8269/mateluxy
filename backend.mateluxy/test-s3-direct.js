import { S3Client, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Set the bucket name directly if it's not in the .env file
const bucketName = process.env.AWS_BUCKET_NAME || 'mateluxy-assets';

// Log configuration
console.log('S3 Configuration:');
console.log('- AWS_REGION:', process.env.AWS_REGION || 'eu-north-1');
console.log('- BUCKET_NAME:', bucketName);
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

// Test if the bucket exists
async function testBucketAccess() {
  try {
    console.log(`Testing access to bucket: ${bucketName}`);
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await s3Client.send(command);
    console.log(`✅ Bucket "${bucketName}" exists and is accessible!`);
    return true;
  } catch (error) {
    console.error(`❌ Error accessing bucket "${bucketName}":`, error.message);
    return false;
  }
}

// Test uploading a small file to the bucket
async function testUpload() {
  try {
    // Only proceed if bucket access test passed
    const bucketAccessible = await testBucketAccess();
    if (!bucketAccessible) {
      console.log('Skipping upload test due to bucket access issues.');
      return;
    }
    
    console.log('Testing file upload to S3...');
    
    // Create a simple test file
    const testKey = `test/test-file-${Date.now()}.txt`;
    const testContent = 'This is a test file to verify S3 upload functionality.';
    
    // Set up upload parameters
    const params = {
      Bucket: bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    };
    
    // Upload the test file
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    console.log(`✅ Successfully uploaded test file to: ${testKey}`);
    console.log(`File URL: https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${testKey}`);
    
  } catch (error) {
    console.error('❌ Error uploading test file:', error.message);
  }
}

// Run the tests
async function runTests() {
  await testUpload();
}

runTests();
