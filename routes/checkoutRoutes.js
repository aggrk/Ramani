import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import { pay } from "../controllers/checkOutController.js";

export const checkoutRouter = express.Router();

checkoutRouter.get("/pay", protect, restrictTo("user", "engineer"), pay);
