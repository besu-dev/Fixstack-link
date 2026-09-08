import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Initialize Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "ech6s64m",
  api_key: process.env.CLOUDINARY_API_KEY || "517998636891614",
  api_secret: process.env.CLOUDINARY_API_SECRET || "9TSaPhomaSSoOli6eXeqQuLS30c",
  secure: true,
});

/**
 * Uploads an avatar image to Cloudinary with resizing, face centering, and compression.
 * Automatically cleans up the temporary local file on disk.
 *
 * @param {string} filePath - Path to local file uploaded via multer
 * @returns {Promise<{ avatarUrl: string, avatarPublicId: string }>}
 */
export const uploadAvatarToCloudinary = async (filePath) => {
  if (!filePath) {
    throw new Error("No file path provided for Cloudinary upload");
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "fixlink/avatars",
      timeout: 15000,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    // Cleanup local temp file once safely uploaded to Cloudinary
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.warn("Failed to delete local temp file:", cleanupErr.message);
    }

    return {
      avatarUrl: result.secure_url,
      avatarPublicId: result.public_id,
    };
  } catch (err) {
    console.warn("--> Cloudinary upload failed or timed out:", err.message);
    throw err;
  }
};

/**
 * Deletes an image from Cloudinary by its public ID.
 *
 * @param {string} publicId - Cloudinary public ID (e.g., 'fixlink/avatars/abc123')
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.warn("Failed to delete old image from Cloudinary:", err.message);
  }
};

/**
 * Extracts the Cloudinary public_id from a full Cloudinary URL.
 * Handles URLs like: https://res.cloudinary.com/cloud/image/upload/v1234/fixlink/avatars/name.jpg
 *
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null} - The public_id or null if not extractable
 */
export const extractPublicId = (url) => {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;

    // Remove version tag (e.g. v1234567/) if present
    const pathAfterUpload = parts[1].replace(/^v\d+\//, "");
    // Remove extension
    const lastDotIndex = pathAfterUpload.lastIndexOf(".");
    if (lastDotIndex === -1) return pathAfterUpload;

    return pathAfterUpload.substring(0, lastDotIndex);
  } catch {
    return null;
  }
};

export default cloudinary;
