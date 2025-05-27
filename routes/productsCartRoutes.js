import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  addToCart,
  deleteProductFromCart,
  getAllCartsOnAHardware,
  getAllCartsOnAllHardware,
  getAllCartsOnProduct,
  getMyCarts,
} from "../controllers/productsCartController.js";

const cartsRouter = express.Router({ mergeParams: true });

cartsRouter.get(
  "/getMyCarts",
  protect,
  restrictTo("user", "engineer"),
  getMyCarts
);

cartsRouter.get(
  "/getAllCarts",
  protect,
  restrictTo("hardware dealer"),
  getAllCartsOnAllHardware
);

cartsRouter.get(
  "/getAllCarts/:hardwareId",
  protect,
  restrictTo("hardware dealer"),
  getAllCartsOnAHardware
);

cartsRouter
  .route("/")
  .get(protect, restrictTo("hardware dealer"), getAllCartsOnProduct)
  .post(protect, restrictTo("user", "engineer"), addToCart);

cartsRouter
  .route("/:id")
  .delete(protect, restrictTo("user", "engineer"), deleteProductFromCart);

export default cartsRouter;
