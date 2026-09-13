const cloudinary = require('cloudinary').v2;
const config = require('../config/env');

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * @param {Buffer} buffer 
 * @param {string} originalname 
 * @param {string} folder 
 * @returns {Promise<{ public_id: string, secure_url: string, format: string, bytes: number }>}
 */
function uploadBufferToCloudinary(buffer, originalname, folder = 'logicai_documents') {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured, throw error
    if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
      return reject(new Error('Cloudinary credentials are not configured'));
    }

    const safeFilename = originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        use_filename: true,
        filename_override: safeFilename,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an asset from Cloudinary by public ID.
 * @param {string} publicId 
 * @param {string} resourceType 
 * @returns {Promise<any>}
 */
async function deleteFromCloudinary(publicId, resourceType = 'raw') {
  if (!publicId || !config.cloudinaryCloudName) return;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset ${publicId}:`, err.message);
  }
}

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
