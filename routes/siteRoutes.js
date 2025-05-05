import express from "express";
import {
  createSite,
  getSite,
  getSites,
  updateSite,
  deleteSite,
} from "../controllers/siteController.js";

export const siteRouter = express.Router();

siteRouter.route("/").get(getSites).post(createSite);
siteRouter.route("/:id").get(getSite).patch(updateSite).delete(deleteSite);
