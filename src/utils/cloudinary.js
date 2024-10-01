import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

console.log("MONGODB_URI: ", process.env.MONGODB_URI)
console.log("CLOUDINARY_CLOUD_NAME :", process.env.CLOUDINARY_CLOUD_NAME)
console.log("CLOUDINARY_API_KEY :", process.env.CLOUDINARY_API_KEY)
console.log("CLOUDINARY_API_SECRET :", process.env.CLOUDINARY_API_SECRET)



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.log("inside catch")
        console.error( "upload failed :", error.message);
        console.error( "full error object :", error);
        return null;
    }
}



export {uploadOnCloudinary}


















// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";


// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret: process.env.CLOUDINARY_API_SECRET 
// });


// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         // console.log("inside try")
//         // console.log("localfilepath 1 : " , localFilePath)
//         if(!localFilePath) return null;
//         // console.log("inside try 1")
//         console.log("localfilepath 2 : " , localFilePath)

//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         console.log("inside try 2")
//         //file has been uploaded successfully
//         console.log("file has been uploaded", response.url);
        
//         // now removing the locally saved temporary file as the upload operation got successfull (for a safe cleaning purpose)
//         fs.unlinkSync(localFilePath);

//         return response;

//     } catch (error) {
//         // now removing the locally saved temporary file as the upload operation got failed (for a safe cleaning purpose)
//         //fs.unlinkSync(localFilePath);
//         console.log("inside catch")
//         console.error( "upload failed :", error.message);
//         console.error( "full error object :", error);
        

//         return null;
//     }
// }

// export { uploadOnCloudinary }