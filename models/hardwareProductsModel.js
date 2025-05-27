import mongoose from "mongoose";

const hardwareProductsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  hardwareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HardwareRegistration",
    required: [true, "Hardware ID is required"],
  },
  // price: {
  //   type: Number,
  //   required: [true, "Price is required"],
  // },
  category: {
    type: String,
    required: [true, "Category is required"],
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
  },
  unit: {
    type: String,
    required: [true, "Unit is required"],
  },
  quantityInStock: {
    type: Number,
    required: [true, "Quantity in stock is required"],
  },
  pricePerUnit: {
    type: Number,
    required: [true, "Price per unit is required"],
  },
  dimensions: String,
  materialType: String,
  grade: String,
  usage: String,
  imageCover: {
    type: String,
    required: [true, "Image cover is required"],
  },
  images: [String],
  warantyPeriod: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const HardwareProducts = mongoose.model(
  "HardwareProducts",
  hardwareProductsSchema
);

export default HardwareProducts;
