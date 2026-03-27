import mongoose, { Schema, model, models } from "mongoose";

const RatingSchema = new Schema({
  jobRequestId: { type: Schema.Types.ObjectId, ref: "JobRequest", required: true },
  ratedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ratedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: "" },
  communication: { type: Number, min: 1, max: 5, default: 5 },
  quality: { type: Number, min: 1, max: 5, default: 5 },
  timeliness: { type: Number, min: 1, max: 5, default: 5 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Rating || model("Rating", RatingSchema);
