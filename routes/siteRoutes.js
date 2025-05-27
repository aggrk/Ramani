import express from "express";
import {
  createSite,
  getSite,
  getSites,
  updateSite,
  deleteSite,
  getSiteByEngineer,
} from "../controllers/siteController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import applicationRouter from "./applicationRoutes.js";

const siteRouter = express.Router();

siteRouter.use("/:siteId/applications", applicationRouter);

siteRouter.get(
  "/getMySites",
  protect,
  restrictTo("engineer"),
  getSiteByEngineer
);

siteRouter
  .route("/")
  .get(protect, getSites)
  .post(protect, restrictTo("engineer"), createSite);

siteRouter
  .route("/:id")
  .get(protect, getSite)
  .patch(protect, restrictTo("admin", "engineer"), updateSite)
  .delete(protect, restrictTo("admin", "engineer"), deleteSite);

export default siteRouter;
