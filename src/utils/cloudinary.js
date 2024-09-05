import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })

        //file has been uploaded successfully
        console.log("file has been uploaded", response.url);
        
        // now removing the locally saved temporary file as the upload operation got successfull (for a safe cleaning purpose)
        fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        // now removing the locally saved temporary file as the upload operation got failed (for a safe cleaning purpose)
        fs.unlinkSync(localFilePath);

        return null;
    }
}

export { uploadOnCloudinary }