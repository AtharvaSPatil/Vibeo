import mongoose, { Schema } from "mongoose";

const videoSchema = mongoose.Schema({
    videoFile: {
        type: String, //* Cloudinary
        required: true,
    },
    thumbnail: {
        type: String, //* Cloudinary
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: [true, "Title is required"],
        index: true,
    },
    description: {
        type: String, 
        required: [true, "Description is required"]
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    
}, { timestamps: true });

export const Video = mongoose.model("Video", videoSchema);
