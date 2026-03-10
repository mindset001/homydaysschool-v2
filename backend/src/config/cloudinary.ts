import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export default cloudinary;

export const uploadToCloudinary = async (
  file: string,
  folder: string = 'high-school-manager'
): Promise<{ url: string; publicId: string }> => {
  // Guard: ensure credentials are present
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error('Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    const message = error?.message || error?.error?.message || JSON.stringify(error);
    throw new Error(`Cloudinary upload failed: ${message}`);
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error);
    throw new Error(`Cloudinary delete failed: ${message}`);
  }
};
