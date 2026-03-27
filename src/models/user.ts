import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["client", "provider", "admin", "super_admin", "sub_admin"], default: "client" },
  emailVerified: { type: Boolean, default: false }, // must verify email
  isApproved: { type: Boolean, default: true },     // only matters for providers
  verificationToken: String,
  verificationTokenExpiry: Date,
  businessId: { type: Schema.Types.ObjectId, ref: "Business", default: null }, // only for providers
  nin: { type: String, required: false, default: null }, // NIN or tax number (required for providers only)
  phoneNumber: { type: String, default: null },
  profilePhoto: { type: String, default: null },
  bio: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 }, // in minutes
  bankDetails: {
    accountName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    bankCode: { type: String, default: null },
    verified: { type: Boolean, default: false }
  },
  walletId: { type: Schema.Types.ObjectId, ref: "Wallet", default: null },
  kyc: {
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    document: { type: String, default: null },
    documentType: { type: String, default: null }, // national_id, passport, etc.
    verifiedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.User || model("User", UserSchema);
