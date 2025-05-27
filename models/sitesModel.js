import mongoose from "mongoose";

const siteSchema = new mongoose.Schema({
  engineerName: {
    type: String,
    required: true,
  },
  siteTitle: {
    type: String,
    required: true,
  },
  siteAddress: {
    street: { type: String, required: true },
    houseNumber: { type: String },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
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
  requiredHandymen: {
    type: Number,
    required: true,
  },
  skillsRequired: {
    type: [String],
    required: true,
  },
  dates: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  paymentPerDay: {
    type: String,
    required: true,
  },
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: { type: String },
  postedAt: {
    type: Date,
    default: Date.now,
  },
});

siteSchema.index({ coordinates: "2dsphere" });

const Site = mongoose.model("Site", siteSchema);
export default Site;
