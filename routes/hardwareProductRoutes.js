import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProductsByHardware,
  getProductByHardwareAndId,
  resizeProductImages,
  updateProduct,
  uploadProductImages,
} from "../controllers/hardwareProductsController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import cartsRouter from "./productsCartRoutes.js";

const productsRouter = express.Router({ mergeParams: true });

productsRouter.use("/:productId/carts", cartsRouter);

productsRouter
  .route("/")
  .get(protect, restrictTo("user", "engineer"), getAllProductsByHardware)
  .post(
    protect,
    restrictTo("hardware dealer"),
    uploadProductImages,
    resizeProductImages,
    createProduct
  );

productsRouter
  .route("/:productId")
  .get(protect, restrictTo("user", "engineer"), getProductByHardwareAndId)
  .patch(
    protect,
    restrictTo("hardware dealer"),
    uploadProductImages,
    resizeProductImages,
    updateProduct
  )
  .delete(protect, restrictTo("hardware dealer"), deleteProduct);

export default productsRouter;
