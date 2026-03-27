import mongoose, { Schema, model, models } from "mongoose";

const TwoFactorAuthSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    isEnabled: { type: Boolean, default: false },
    method: {
      type: String,
      enum: ["email", "authenticator"],
      default: "email",
    },
    // For authenticator apps
    secret: { type: String, default: null },
    qrCode: { type: String, default: null }, // Base64 encoded QR code
    // For email method
    backupCodes: [{ type: String }], // For account recovery
    verificationCode: { type: String, default: null },
    verificationCodeExpiry: { type: Date, default: null },
    // Device trust
    trustedDevices: [
      {
        deviceId: { type: String, required: true },
        name: { type: String },
        userAgent: { type: String },
        ipAddress: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    // For admins - 2FA is mandatory
    isMandatory: { type: Boolean, default: false },
    mandatoryFrom: { type: Date, default: null },
    lastVerifiedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TwoFactorAuthSchema.index({ userId: 1 });

export const TwoFactorAuth = models.TwoFactorAuth || model("TwoFactorAuth", TwoFactorAuthSchema);
export default TwoFactorAuth;
