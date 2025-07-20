import { User } from "../models/user.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadOnCloudinary } from "../utils/index.js";

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

export {registerUser}