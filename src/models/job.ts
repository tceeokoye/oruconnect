import mongoose, { Schema, model, models } from "mongoose";

const JobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, default: null },
  // (Client posts generic job OR Provider posts a service listing)
  provider: { type: Schema.Types.ObjectId, ref: "User", default: null },
  client: { type: Schema.Types.ObjectId, ref: "User", default: null },
  targetProvider: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Used when a Client assigns this directly to a Provider
  status: { 
    type: String, 
    enum: ["draft", "published", "closed", "archived", "open"],
    default: "published"
  },
  priceType: {
    type: String,
    enum: ["fixed", "negotiable"],
    default: "negotiable"
  },
  fixedPrice: { type: Number, default: null }, // Only if priceType is fixed
  budget: { type: Number, default: null }, // Added for Upwork-style generic jobs
  timeline: { type: String, default: null }, // Added for generic jobs
  location: { type: String, default: null }, // Added for generic jobs
  images: [{ type: String }],
  tags: [{ type: String }],
  deliveryTime: { type: Number }, // in days
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Job || model("Job", JobSchema);
