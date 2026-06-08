import multer from 'multer';

// Use memory storage so we can upload buffer directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ storage });
