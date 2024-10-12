import multer from 'multer';
import cloudinary from './cloudinary.js';
import { v2 as cloudinaryV2 } from 'cloudinary'; // Use Cloudinary v2 SDK for better clarity
import fs from 'fs';
import path from 'path';

// Configure Multer to store files temporarily in memory or disk
const storage = multer.memoryStorage(); // Can use diskStorage if you prefer saving to disk first

const upload = multer({
  storage: storage,
  limits: { fileSize: 80 * 1024 * 1024 } // Limit to 80MB
});

// Function to upload a file to Cloudinary
const uploadToCloudinary = async (file, folder, resourceType) => {
  try {
    // Upload the file buffer to Cloudinary
    const result = await cloudinaryV2.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) throw new Error(error);
        return result;
      }
    );

    return result;
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);
    throw err;
  }
};

// Middleware to handle file uploads
export const handleFileUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' }); // Full month name, e.g., "June"

    // Get the section (or folder) from the request or default to 'products'
    const section = req.section || 'products';
    const folder = `${section}/${year}/${month}`;
    const resourceType = req.file.mimetype.startsWith('image') ? 'image' : 'auto';

    // Upload the file buffer to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, folder, resourceType);

    // You can now store the Cloudinary upload result URL (uploadResult.url) to your database

    res.status(200).json({ message: 'File uploaded successfully', url: uploadResult.secure_url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'File upload failed', error });
  }
};

export default upload;
