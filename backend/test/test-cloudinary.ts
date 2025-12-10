import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from '../src/utils/cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Sample base64 image (1x1 red pixel PNG)
const testBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Sample base64 JPEG image (1x1 blue pixel)
const testBase64Image2 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

async function testCloudinaryIntegration() {
  console.log('🧪 Testing Cloudinary Integration\n');
  console.log('Environment Variables:');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Not Set');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Not Set');
  console.log('\n---\n');

  try {
    // Test 1: Upload single image
    console.log('Test 1: Uploading single image to Cloudinary...');
    const singleImageUrl = await uploadImageToCloudinary(testBase64Image, 'test-expenses');
    console.log('✅ Single image uploaded successfully!');
    console.log('Image URL:', singleImageUrl);
    console.log('\n---\n');

    // Test 2: Upload multiple images
    console.log('Test 2: Uploading multiple images to Cloudinary...');
    const multipleImageUrls = await uploadMultipleImagesToCloudinary(
      [testBase64Image, testBase64Image2],
      'test-expenses'
    );
    console.log('✅ Multiple images uploaded successfully!');
    console.log('Image URLs:');
    multipleImageUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    console.log('\n---\n');

    console.log('🎉 All tests passed! Cloudinary integration is working correctly.');
    console.log('\nYou can view your uploaded test images in your Cloudinary dashboard:');
    console.log(`https://console.cloudinary.com/console/c-${process.env.CLOUDINARY_API_KEY}/media_library/folders/test-expenses`);
    
  } catch (error: any) {
    console.error('❌ Test failed with error:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('cloud_name')) {
      console.error('\n⚠️  Cloud name issue detected!');
      console.error('Please check that CLOUDINARY_CLOUD_NAME in .env file:');
      console.error('  - Contains no spaces');
      console.error('  - Matches exactly what is shown in your Cloudinary dashboard');
      console.error('  - Is not wrapped in quotes');
    }
    
    process.exit(1);
  }
}

// Run the test
testCloudinaryIntegration();
