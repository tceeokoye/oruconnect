import mongoose, { Schema, model, models } from "mongoose";

const DisputeSchema = new Schema({
  jobRequestId: { type: Schema.Types.ObjectId, ref: "JobRequest", required: true },
  escrowId: { type: Schema.Types.ObjectId, ref: "Escrow", required: true },
  complainant: { type: Schema.Types.ObjectId, ref: "User", required: true }, // client or provider
  defendant: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  evidence: [{ type: String }], // file URLs
  status: {
    type: String,
    enum: ["open", "under_review", "resolved", "escalated"],
    default: "open"
  },
  resolution: { type: String, default: null },
  resolutionType: {
    type: String,
    enum: ["full_refund", "partial_refund", "complete_release", "split"],
    default: null
  },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

export default models.Dispute || model("Dispute", DisputeSchema);
