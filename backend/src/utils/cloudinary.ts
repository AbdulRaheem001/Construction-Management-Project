import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
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
  try {
    const uploadPromises = base64Images.map((image) =>
      uploadImageToCloudinary(image, folder)
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Failed to upload images to Cloudinary');
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
  try {
    // Extract public_id from the URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/');
    const publicId = publicIdWithExtension.split('.')[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary');
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
  try {
    const deletePromises = imageUrls.map((url) =>
      deleteImageFromCloudinary(url)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw new Error('Failed to delete images from Cloudinary');
  }
};

export default cloudinary;
