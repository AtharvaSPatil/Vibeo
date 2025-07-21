import { User } from "../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadOnCloudinary } from "../utils/index.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong with the generation of tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { email, fullName, password, username } = req.body;

    if(fullName === "") {
        throw new ApiError(400, "All fields are required")
    }
    else if(email === "") {
        throw new ApiError(400, "All fields are required");
    }
    else if(password === "") {
        throw new ApiError(400, "All fields are required");
    }
    else if(username === "") {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser) {
        throw new ApiError(409, "User already Exists");
    }
    // Some cloudinary issue needs fix
    const avatarLocalPath = ""
    const coverImageLocalPath = ""
    // const avatarLocalPath = req.files?.avatar[0]?.path 
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    // console.log("avatar path", avatarLocalPath);
    // if(!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar path is required");
    // }

    const avatar = "";
    const coverImage = "";
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // if(!avatar) {
    //     throw new ApiError(400, "Avatar is required");
    // }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while sign up")
    }
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User saved successfully")
    )
} )

const loginUser = asyncHandler(async (req, res) => {
    // take user email and password from req.body
    // username or email is necessary
    // find user
    // password check: use bcrypt to validate if the password is correct or not 
    // only allow access if the password matches
    // send in cookies  

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "Username or email is required");
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    
    // This new user variable is required because the "user" reference that we already have does not have the refresh and access tokens because it is initialized before the generation hence a new db call required for updated user hence "loggedInUser"  
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options= {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    }, "User logged In successfully"))

     

})

const logoutUser = asyncHandler(async (req, res) => {
    // clear cookies
    // reset refreshToken
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        },
    },
    {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(400, "Unauthorized access");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {
                accessToken, refreshToken: newRefreshToken
            }, "Access token refreshed")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    // get the current password from req.body 
    // validate the password 
    // get new values for passrword 
    // update the user fields 
    // also generate new access and refresh tokens

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user)
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    if(fullName || email){
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        }
    }, {new: true}).select("-password")
    return res.status(200).json(new ApiResponse(200, user, "Account details upadted successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})


export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage}