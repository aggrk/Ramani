import mongoose from "mongoose";

const productsCartSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HardwareProducts",
    required: [true, "Product ID is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
});

productsCartSchema.index({ productId: 1, userId: 1 }, { unique: true });

const ProductsCart = mongoose.model("ProductsCart", productsCartSchema);

export default ProductsCart;
