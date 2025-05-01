import multer from 'multer';
import path from 'path';

// Configure storage for post media
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads/posts'); // Store post media in Uploads/posts directory
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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