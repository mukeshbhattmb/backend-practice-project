import { asyncHandler } from "../utils/asyncHandler.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}




const registerUser = asyncHandler( async (req, res) => {
    
    // get users details from frontend
    // validation - not empty
    // check if the user already exists : check username, email
    // check for images, check for avatar
    // upload them to cloudinary, check for avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    // get users details from frontend --------------------

    const { fullName, email, username, password } = req.body
    // console.log("email : ",email);


    // validation - not empty --------------------

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")

        // [fullName, email, username, password].some((field) => !field || field.trim() === "")         for more clearity
    ) {
        throw new ApiError(400, "All fields are required");
    }


    // check if the user already exists : check username, email --------------------

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // check for images, check for avatar --------------------

    // console.log(req.files);

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
        avatarLocalPath = req.files.avatar[0].path
    }
    // console.log(avatarLocalPath)

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    // console.log(coverImageLocalPath)

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!!")
    }


    // upload them to cloudinary, check for avatar --------------------

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log(avatar)
    // console.log(coverImage)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    // create user object - create entry in db --------------------

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })


    // remove password and refresh token field from response --------------------

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
 

    // check for user creation --------------------

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    // return res --------------------

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )




const loginUser = asyncHandler( async(req, res) => {
    // get data from req.body
    // check username or email
    // find the user - whether user exist or not
    // check for password
    // generate Access and Refresh token
    // send cookies (send tokens in cookies)
    // send response

    // get data from req.body --------------------
    
    const {email, username, password} = req.body


    // check username or email --------------------

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    // Here is an alternative of above code:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }


    // find the user - whether user exist or not --------------------

    const user = await User.findOne({
        $or : [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }


    // check for password --------------------

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,  "Invalid user credentials")
    }


    // generate Access and Refresh token --------------------

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)


    // send cookies (send tokens in cookies)

    const loggedInUser = await User.findById(user._id).select ("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})  




const logoutUser = asyncHandler(async (req, res) => {
    // clear user cookies
    // reset access token and refresh token

    // for that we need user and for that we creating our own middleware auth.middleware.js

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1 // this removes this field from the document
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }


    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    )

})




const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefereshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefereshToken){
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefereshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken._id)

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefereshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("newRefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken : newRefreshToken},
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
 })



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
 }