import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config.js';

// Configure storage for post media using Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'friendly/posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mpeg', 'quicktime'],
        resource_type: 'auto',
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }
        ]
    }
});

// File filter to allow only images and videos
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
    
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, MPEG, QuickTime) are allowed.'), false);
    }
};

// Configure multer with storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB file size limit
        files: 5 // Maximum 5 files per upload
    }
});

export default upload;