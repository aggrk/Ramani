import express from "express";
import {
  approveHardware,
  deleteHardware,
  getAllHardware,
  getAllHardwareForAdmin,
  getHardwareById,
  getMyHardware,
  registerHardware,
  updateHardware,
  upload,
} from "../controllers/hardwareController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import productsRouter from "./hadwareProductRoutes.js";

const hardwareRouter = express.Router();

hardwareRouter.use("/:hardwareId/products", productsRouter);

hardwareRouter.get(
  "/getAllHardwareForAdmin",
  protect,
  restrictTo("admin"),
  getAllHardwareForAdmin
);

hardwareRouter.get(
  "/myHardware",
  protect,
  restrictTo("hardware dealer"),
  getMyHardware
);

hardwareRouter.patch(
  "/approveHardware/:hardwareId",
  protect,
  restrictTo("admin"),
  approveHardware
);

hardwareRouter
  .route("/")
  .get(protect, restrictTo("admin", "user", "engineer"), getAllHardware)
  .post(protect, restrictTo("hardware dealer"), upload, registerHardware);

hardwareRouter
  .route("/:id")
  .get(protect, restrictTo("admin", "user", "engineer"), getHardwareById)
  .patch(
    protect,
    restrictTo("admin", "hardware dealer"),
    upload,
    updateHardware
  )
  .delete(protect, restrictTo("admin", "hardware dealer"), deleteHardware);

export default hardwareRouter;
