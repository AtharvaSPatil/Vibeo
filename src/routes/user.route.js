import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/index.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }]), 
    registerUser);

userRouter.route("/login").post(loginUser)

// secured route hai kyuki isme verifyJWt middleware which check if user is logged in or not 
userRouter.route("/logout").post(verifyJwt, logoutUser)

userRouter.route("/refresh-token").post(refreshAccessToken)

export { userRouter };
