const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // Determine resource type based on file extension
        const fileExt = localFilePath.split('.').pop().toLowerCase();
        const resourceType = fileExt === 'pdf' || 
                           fileExt === 'doc' || 
                           fileExt === 'docx' ? 'raw' : 'auto';

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: resourceType,
            secure: true,
        });
        // console.log("File uploaded successfully on cloudinary", response.url);
        
        fs.unlinkSync(localFilePath);
        return response;
        
    } catch (error) {
         fs.unlinkSync(localFilePath); 
         return null;
    }
}


const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        console.log(`Deleted ${publicId} from Cloudinary`, result);
        return result;
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        return null;
    }
};

module.exports = {
    uploadOnCloudinary,
    deleteFromCloudinary
};