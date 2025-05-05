import mongoose from "mongoose";

const siteSchema = new mongoose.Schema({
  engineer_name: { type: String, required: true },
  site_title: { type: String, required: true },
  location: { type: String, required: true },
  required_handymen: { type: Number, required: true },
  skills_required: { type: [String], required: true },
  dates: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  payment_per_day: { type: String, required: true },
  // currency: { type: String, default: "TZS" },
  description: { type: String },
  posted_at: { type: Date, default: Date.now },
});

export const Site = mongoose.model("Site", siteSchema);
