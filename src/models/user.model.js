import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: [true, "username must be unique"],
        index: true,
        lowercase: [true, "username should be lowercased"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email already exists"],
        lowercase: [true, "email must be lowercased"],
        trim: true
    },
    fullName: {
        type: String,
        required: [true, "full name is required"],
        trim: true
    },
    avatar: {
        type: String, //* Cloudinary
        required: [true, "avatar is required"],
    },
    comerImage: {
        type: String, //* Cloudinary
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "password is required"],
    },
    refreshToken: {
        type: String,

    }
}, {timestamps: true});

export const User = mongoose.model("User", userSchema);
