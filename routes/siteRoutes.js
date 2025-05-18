import express from "express";
import {
  createSite,
  getSite,
  getSites,
  updateSite,
  deleteSite,
} from "../controllers/siteController.js";
import { protect, restrictTo } from "../controllers/authController.js";

export const siteRouter = express.Router();

siteRouter
  .route("/")
  .get(protect, getSites)
  .post(protect, restrictTo("engineer", "admin"), createSite);

siteRouter
  .route("/:id")
  .get(protect, getSite)
  .patch(protect, restrictTo("engineer", "admin"), updateSite)
  .delete(protect, restrictTo("admin"), deleteSite);
