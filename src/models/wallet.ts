import mongoose, { Schema, model, models } from "mongoose";

const WalletSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  availableBalance: { type: Number, default: 0 },
  lockedBalance: { type: Number, default: 0 }, // Amount in escrow
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastTransactionDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Wallet || model("Wallet", WalletSchema);
