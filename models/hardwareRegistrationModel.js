import mongoose from "mongoose";
import validator from "validator";

const hardwareRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Hardware Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function (v) {
        return /^(\+255|0)[67][0-9]{8}$/.test(v); // Ensures exactly 10 digits
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit phone number!`,
    },
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Dealer ID is required"],
  },

  address: {
    street: {
      type: String,
      required: [true, "Street is required"],
    },
    houseNumber: {
      type: String,
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    region: {
      type: String,
      required: [true, "Region is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },

  licenseUpload: {
    type: String,
    required: [true, "License upload is required"],
  },
  status: {
    type: String,
    enum: ["pending", "verified"],
    validate: {
      validator: function (v) {
        return ["pending", "verified"].includes(v);
      },
      message: (props) => `${props.value} is not a valid status!`,
    },
    default: "pending",
  },
});

hardwareRegistrationSchema.index({ coordinates: "2dsphere" });

const HardwareRegistration = mongoose.model(
  "HardwareRegistration",
  hardwareRegistrationSchema
);
export default HardwareRegistration;
