import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Validate Cloudinary environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

if (!isCloudinaryConfigured) {
  console.warn('⚠️  Cloudinary configuration missing. Image uploads will be disabled.');
  console.warn(`CLOUDINARY_CLOUD_NAME: ${cloudName ? 'Set' : 'Missing'}`);
  console.warn(`CLOUDINARY_API_KEY: ${apiKey ? 'Set' : 'Missing'}`);
  console.warn(`CLOUDINARY_API_SECRET: ${apiSecret ? 'Set' : 'Missing'}`);
} else {
  // Configure Cloudinary only if credentials are available
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log('✅ Cloudinary configured successfully');
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param folder - Folder name in Cloudinary (default: 'expenses')
 * @returns Cloudinary upload result with secure URL
 */
export const uploadImageToCloudinary = async (
  base64Image: string,
  folder: string = 'expenses'
): Promise<string> => {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Skipping image upload.');
    throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
        { quality: 'auto:good' }, // Auto optimize quality
        { fetch_format: 'auto' }, // Auto format (WebP when supported)
      ],
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error.message || error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Upload multiple base64 images to Cloudinary
 * @param base64Images - Array of base64 encoded image strings
 * @param folder - Folder name in Cloudinary (default: 'expenses')
 * @returns Array of Cloudinary secure URLs
 */
export const uploadMultipleImagesToCloudinary = async (
  base64Images: string[],
  folder: string = 'expenses'
): Promise<string[]> => {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Skipping image uploads.');
    return []; // Return empty array instead of throwing error
  }

  try {
    const uploadPromises = base64Images.map((image) =>
      uploadImageToCloudinary(image, folder)
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    console.error('Error uploading multiple images to Cloudinary:', error.message || error);
    // Return empty array instead of throwing error to allow operation to continue
    return [];
  }
};

/**
 * Delete an image from Cloudinary
 * @param imageUrl - The URL of the image to delete
 * @returns Delete result
 */
export const deleteImageFromCloudinary = async (
  imageUrl: string
): Promise<void> => {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Skipping image deletion.');
    return;
  }

  try {
    // Extract public_id from the URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/');
    const publicId = publicIdWithExtension.split('.')[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error('Error deleting image from Cloudinary:', error.message || error);
    // Don't throw error, just log it
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param imageUrls - Array of image URLs to delete
 * @returns Delete results
 */
export const deleteMultipleImagesFromCloudinary = async (
  imageUrls: string[]
): Promise<void> => {
  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Skipping image deletions.');
    return;
  }

  try {
    const deletePromises = imageUrls.map((url) =>
      deleteImageFromCloudinary(url)
    );
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error deleting multiple images from Cloudinary:', error.message || error);
    // Don't throw error, just log it
  }
};

export default cloudinary;
