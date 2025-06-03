import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "complete"],
    default: "pending",
  },
});

const Checkout = mongoose.model("Checkout", checkoutSchema);

export default Checkout;
