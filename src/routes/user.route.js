import { Router } from "express";
import { registerUser } from "../controllers/index.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser)

export {userRouter};