import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Standard Cloudinary config
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock_cloud') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a local file buffer or file path to Cloudinary.
 * Falls back to mock URL if Cloudinary is not configured or fails.
 */
export const uploadImage = async (fileBuffer, folderName = 'youngo_uploads') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud') {
      console.log('Using local mock upload fallback.');
      // Return a nice placeholder or mock URL
      return {
        secure_url: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/300`,
        public_id: `mock_${Date.now()}`
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            // Fallback
            resolve({
              secure_url: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/300`,
              public_id: `mock_${Date.now()}`
            });
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } catch (err) {
    console.error('Upload handler exception:', err);
    return {
      secure_url: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/300`,
      public_id: `mock_${Date.now()}`
    };
  }
};

export default cloudinary;
