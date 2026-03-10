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
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error('Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error: any) {
    const message = error?.message || error?.error?.message || JSON.stringify(error);
    throw new Error(`Cloudinary upload failed: ${message}`);
  }
};

// Upload a buffer to Cloudinary using base64 data URI — avoids stream ECONNRESET issues
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = 'high-school-manager',
  resourceType: 'image' | 'raw' | 'auto' = 'auto',
  retries = 3
): Promise<{ url: string; publicId: string }> => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new Error('Cloudinary credentials are not configured.');
  }

  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: resourceType,
      });
      return { url: result.secure_url, publicId: result.public_id };
    } catch (error: any) {
      const message = error?.message || JSON.stringify(error);
      const isNetworkError = message.includes('ECONNRESET') || message.includes('ETIMEDOUT') || message.includes('ENOTFOUND');
      if (isNetworkError && attempt < retries) {
        // Wait before retrying: 1s, 2s, 3s...
        await new Promise(res => setTimeout(res, attempt * 1000));
        continue;
      }
      throw new Error(`Cloudinary upload failed: ${message}`);
    }
  }

  throw new Error('Cloudinary upload failed after all retries.');
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    const message = error?.message || JSON.stringify(error);
    throw new Error(`Cloudinary delete failed: ${message}`);
  }
};

