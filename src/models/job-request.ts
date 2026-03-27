import mongoose, { Schema, model, models } from "mongoose";

const JobRequestSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  client: { type: Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "negotiating", "completed", "cancelled"],
    default: "pending"
  },
  budget: { type: Number, default: null },
  negotiatedBudget: { type: Number, default: null },
  jobDescription: { type: String, required: true },
  timeframe: { type: String, required: true },
  message: { type: String, default: "" },
  attachments: [{ type: String }],
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null },
  acceptedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  totalAmount: { type: Number, default: null },
});

export default models.JobRequest || model("JobRequest", JobRequestSchema);
