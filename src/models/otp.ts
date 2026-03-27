import mongoose, { Schema, model, models } from "mongoose";

const OTPSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    code: { type: String, required: true }, // 6-digit OTP
    purpose: {
      type: String,
      enum: ["login", "2fa_verification", "email_verification", "password_reset"],
      default: "login",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true }, // Typically 10 minutes from creation
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ userId: 1, purpose: 1 });
OTPSchema.index({ email: 1, purpose: 1 });

export const OTP = models.OTP || model("OTP", OTPSchema);
export default OTP;
