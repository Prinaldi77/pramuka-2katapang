const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

/**
 * Uploads a local file to Supabase Storage bucket and deletes the local file.
 * @param {Object} file - Express multer file object
 * @param {string} bucket - Supabase bucket name
 * @returns {Promise<string|null>} Public URL of the uploaded file
 */
const uploadFile = async (file, bucket) => {
  if (!file) return null;

  try {
    const fileBuffer = fs.readFileSync(file.path);
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase Storage bucket '${bucket}': ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Clean up local temp file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    // Ensure clean up of local temp file on error
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error(`Error unlinking local temp file: ${unlinkError.message}`);
      }
    }
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage by extracting its name from public URL.
 * @param {string} fileUrl - Public URL of the file to delete
 * @param {string} bucket - Supabase bucket name
 */
const deleteFile = async (fileUrl, bucket) => {
  if (!fileUrl) return;

  try {
    // Extract filename from URL
    // Public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[filename]
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) return;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error(`Failed to delete file from Supabase storage bucket '${bucket}': ${error.message}`);
    }
  } catch (err) {
    console.error(`Error deleting file from storage: ${err.message}`);
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
