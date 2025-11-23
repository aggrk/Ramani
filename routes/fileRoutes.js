import express from "express";
import { getUploadedFile } from "../controllers/fileController.js";
import { protect } from "../controllers/authController.js";

export const fileRouter = express.Router();

fileRouter.get("/:filename", protect, getUploadedFile);
