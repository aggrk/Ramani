import HardwareProducts from "../models/hardwareProductsModel.js";
import HardwareRegistration from "../models/hardwareRegistrationModel.js";
import ProductsCart from "../models/productsCartModel.js";
import { CustomError } from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const addToCart = catchAsync(async (req, res, next) => {
  const alreadyExist = await ProductsCart.findOne({
    productId: req.params.productId,
    userId: req.user._id,
  });

  if (alreadyExist)
    return next(new CustomError("Product already exist in cart", 400));

  const product = await ProductsCart.create({
    productId: req.params.productId,
    userId: req.user._id,
  });

  res.status(201).json({
    status: "success",
    data: product,
  });
});

export const getMyCarts = catchAsync(async (req, res, next) => {
  const products = await ProductsCart.find({ userId: req.user._id }).populate(
    "productId"
  );

  if (!products)
    return next(new CustomError("No products in carts for this user", 404));

  res.status(200).json({
    status: "success",
    data: products,
  });
});

export const getAllCartsOnAllHardware = catchAsync(async (req, res, next) => {
  // Step 1: Get all hardware owned by the current user
  const userHardware = await HardwareRegistration.find({
    dealerId: req.user._id,
  });
  if (userHardware.length === 0)
    return next(new CustomError("You do not own a hardware", 404));

  const hardwareIds = userHardware.map((hw) => hw._id);

  // Step 2: Find all products that belong to user's hardware
  const products = await HardwareProducts.find({
    hardwareId: { $in: hardwareIds },
  });
  const productIds = products.map((prod) => prod._id);

  // Step 3: Get all cart entries for those products
  const cartItems = await ProductsCart.find({ productId: { $in: productIds } })
    .populate({
      path: "productId",
      populate: {
        path: "hardwareId",
        model: "HardwareRegistration",
      },
    })
    .populate("userId");

  if (cartItems.length === 0)
    return next(new CustomError("No cart items for this hardware", 404));

  res.status(200).json({
    status: "success",
    result: cartItems.length,
    data: cartItems,
  });
});

export const getAllCartsOnProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  // Step 1: Fetch the product and populate its hardware
  const product = await HardwareProducts.findById(productId).populate(
    "hardwareId"
  );

  if (!product) {
    return next(new CustomError("Product not found", 404));
  }

  const hardware = product.hardwareId;

  if (!hardware) {
    return next(new CustomError("Hardware for this product not found", 404));
  }

  // Step 2: Check if the logged-in user owns the hardware
  if (!hardware.dealerId.equals(req.user._id)) {
    return next(
      new CustomError(
        "You are not authorized to view cart items for this product",
        403
      )
    );
  }

  // Step 3: Fetch all cart items for this product
  const cartItems = await ProductsCart.find({ productId }).populate("userId"); // Optional: show users who added it

  res.status(200).json({
    status: "success",
    count: cartItems.length,
    data: {
      product,
      hardware,
      cartItems,
    },
  });
});

export const getAllCartsOnAHardware = catchAsync(async (req, res, next) => {
  const { hardwareId } = req.params;

  // Step 1: Check if hardware exists and belongs to current user
  const hardware = await HardwareRegistration.findById(hardwareId);
  if (!hardware)
    return next(new CustomError("No hardware found with this ID", 404));

  if (!hardware.dealerId.equals(req.user._id))
    return next(
      new CustomError(
        "You are not authorized to view cart items on this hardware",
        403
      )
    );

  // Step 2: Get all products that belong to this hardware
  const products = await HardwareProducts.find({ hardwareId });
  const productIds = products.map((product) => product._id);

  // Step 3: Get all cart items that match those product IDs
  const cartItems = await ProductsCart.find({
    productId: { $in: productIds },
  }).populate({
    path: "productId",
    populate: {
      path: "hardwareId",
      model: "HardwareRegistration",
    },
  });

  res.status(200).json({
    status: "success",
    result: cartItems.length,
    data: cartItems,
  });
});

export const deleteProductFromCart = catchAsync(async (req, res, next) => {
  const deletedCartItem = await ProductsCart.findOneAndDelete({
    _id: req.params.id,
    productId: req.params.productId,
    userId: req.user._id,
  });

  if (!deletedCartItem) {
    return next(new CustomError("Cart item not found or not authorized", 404));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});
