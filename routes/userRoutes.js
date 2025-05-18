import express from "express";
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  verifyEmail,
} from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/verifyEmail/:id", verifyEmail);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

export { userRouter };
