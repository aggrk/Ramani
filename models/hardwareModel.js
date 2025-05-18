import mongoose from "mongoose";

const hardwareSchema = new mongoose.Schema({
  hardware_name: {
    type: String,
    required: [true, "Hardware name must be filled"],
  },
  location: {
    type: String,
    required: [true, "The hardware location must be filled"],
  },
});

export const Hardware = mongoose.model("Hardware", hardwareSchema);
