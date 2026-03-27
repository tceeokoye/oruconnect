import mongoose, { Schema, model, models } from "mongoose";

const EscrowSchema = new Schema({
  jobRequestId: { type: Schema.Types.ObjectId, ref: "JobRequest", required: true },
  client: { type: Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 }, // 6%
  providerAdvance: { type: Number, default: 0 }, // 30% of amount
  status: {
    type: String,
    enum: ["held", "partial_released", "completed", "disputed", "refunded"],
    default: "held"
  },
  createdAt: { type: Date, default: Date.now },
  advanceReleasedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  refundedAt: { type: Date, default: null },
  monifyReference: { type: String, default: null },
});

export default models.Escrow || model("Escrow", EscrowSchema);
