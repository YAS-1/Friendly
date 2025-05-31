import cloudinary from '../config/cloudinary.config.js';

// Function to delete a file from Cloudinary
export const deleteFromCloudinary = async (publicUrl) => {
    try {
        if (!publicUrl) return;

        // Extract public_id from the URL
        const publicId = publicUrl.split('/').slice(-1)[0].split('.')[0];
        
        // Delete the file
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

// Function to delete multiple files from Cloudinary
export const deleteMultipleFromCloudinary = async (publicUrls) => {
    try {
        if (!publicUrls || !publicUrls.length) return;

        const deletePromises = publicUrls.map(url => deleteFromCloudinary(url));
        const results = await Promise.all(deletePromises);
        return results;
    } catch (error) {
        console.error('Error deleting multiple files from Cloudinary:', error);
        throw error;
    }
}; 