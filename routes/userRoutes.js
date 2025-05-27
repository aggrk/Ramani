import express from "express";
import {
  forgotPassword,
  login,
  logout,
  protect,
  resendVerificationEmail,
  resetPassword,
  restrictTo,
  signup,
  updateMyPassword,
  verifyEmail,
} from "../controllers/authController.js";
import {
  createUser,
  deleteMe,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
  resizeUserPhoto,
  updateMe,
  updateUser,
  uploadUserPhoto,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", protect, logout);
userRouter.get("/verifyEmail/:token", verifyEmail);
userRouter.post("/resendVerificationEmail", resendVerificationEmail);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

userRouter.use(protect);
userRouter.get("/me", getMe);
userRouter.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
userRouter.delete("/deleteMe", deleteMe);
userRouter.patch("/updateMyPassword", updateMyPassword);

userRouter.use(restrictTo("admin"));
userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default userRouter;
