import multer from "multer";
import sharp from "sharp";
import HardwareProducts from "../models/hardwareProductsModel.js";
import HardwareRegistration from "../models/hardwareRegistrationModel.js";
import { CustomError } from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new CustomError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

export const resizeProductImages = async (req, res, next) => {
  if (!req.files) return next();

  // 1) Cover image
  if (req.files.imageCover) {
    const coverFilename = `product-${
      req.params.hardwareId
    }-${Date.now()}-cover.jpeg`;

    try {
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${coverFilename}`);
      req.body.imageCover = coverFilename;
    } catch (error) {
      return next(
        new CustomError(`Failed to process cover image: ${error.message}`, 500)
      );
    }
  }

  if (req.files.images) {
    // 2) Images
    req.body.images = [];
    try {
      await Promise.all(
        req.files.images.map(async (file, i) => {
          const filename = `product-${req.params.hardwareId}-${Date.now()}-${
            i + 1
          }.jpeg`;
          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`public/img/products/${filename}`);
          req.body.images.push(filename);
        })
      );
    } catch (error) {
      return next(
        new CustomError(`Failed to process cover image: ${error.message}`, 500)
      );
    }
  }
  next();
};

export const createProduct = catchAsync(async (req, res, next) => {
  const selectedHardware = await HardwareRegistration.findById(
    req.params.hardwareId
  );
  if (!selectedHardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }

  if (selectedHardware.status !== "verified")
    return next(
      new CustomError(
        "You hardware is not verified. Please wait for verification to proceed with adding products.",
        403
      )
    );

  const isHardwareDealer = selectedHardware.dealerId.equals(req.user._id);
  if (!isHardwareDealer) {
    return next(
      new CustomError(
        "You are not authorized to create a product in this hardware",
        403
      )
    );
  }

  const product = await HardwareProducts.create({
    ...req.body,
    hardwareId: req.params.hardwareId,
  });
  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const getAllProductsByHardware = catchAsync(async (req, res, next) => {
  const selectedHardware = await HardwareRegistration.findById(
    req.params.hardwareId
  );
  if (!selectedHardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }

  if (selectedHardware.status !== "verified")
    return next(new CustomError("You hardware is not verified.", 403));

  const products = await HardwareProducts.find({
    hardwareId: req.params.hardwareId,
  });

  if (!products) {
    return next(new CustomError("No products found for this hardware", 404));
  }

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

export const getProductByHardwareAndId = catchAsync(async (req, res, next) => {
  const selectedHardware = await HardwareRegistration.findById(
    req.params.hardwareId
  );
  if (!selectedHardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }

  if (selectedHardware.status !== "verified")
    return next(new CustomError("You hardware is not verified.", 403));

  const product = await HardwareProducts.findOne({
    _id: req.params.productId,
    hardwareId: req.params.hardwareId,
  });

  if (!product) {
    return next(new CustomError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const selectedHardware = await HardwareRegistration.findById(
    req.params.hardwareId
  );
  if (!selectedHardware) {
    return next(new CustomError("No hardware found with that ID", 404));
  }

  if (selectedHardware.status !== "verified")
    return next(new CustomError("Your hardware is not verified.", 403));

  const isHardwareDealer = selectedHardware.dealerId.equals(req.user._id);
  if (!isHardwareDealer) {
    return next(
      new CustomError(
        "You are not authorized to update a product in this hardware",
        403
      )
    );
  }

  const product = await HardwareProducts.findOneAndUpdate(
    { _id: req.params.productId, hardwareId: req.params.hardwareId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    return next(new CustomError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const selectedHardware = await HardwareRegistration.findById(
    req.params.hardwareId
  );

  if (!selectedHardware)
    return next(new CustomError("No hardware with this ID", 404));

  if (selectedHardware.dealerId.toString() !== req.user._id.toString())
    return next(
      new CustomError(
        "You are not authorized to delete the products in this hardware",
        403
      )
    );

  if (selectedHardware.status !== "verified")
    return next(new CustomError("Your hardware is not verified", 403));

  const product = await HardwareProducts.findOneAndDelete({
    _id: req.params.productId,
    hardwareId: req.params.hardwareId,
  });

  if (!product)
    return next(new CustomError("No product found with this ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
