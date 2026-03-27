import mongoose, { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  transactionId: { type: String, unique: true, required: true },
  type: {
    type: String,
    enum: ["credit", "debit", "escrow_hold", "escrow_release", "refund", "platform_fee", "withdrawal"],
    required: true
  },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  relatedUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  jobRequestId: { type: Schema.Types.ObjectId, ref: "JobRequest", default: null },
  escrowId: { type: Schema.Types.ObjectId, ref: "Escrow", default: null },
  amount: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending"
  },
  description: { type: String, required: true },
  paymentMethod: { type: String, default: null }, // card, bank, wallet
  paymentReference: { type: String, default: null }, // Monify reference
  platformFee: { type: Number, default: 0 }, // 6% of transaction
  providerAmount: { type: Number, default: 0 }, // 30% advance or full
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Transaction || model("Transaction", TransactionSchema);
