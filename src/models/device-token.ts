import mongoose, { Schema, model, models } from "mongoose";

const DeviceTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["web", "ios", "android"], default: "web" },
    lastSeenAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DeviceTokenSchema.index({ userId: 1 });
DeviceTokenSchema.index({ token: 1 });

export const DeviceToken = models.DeviceToken || model("DeviceToken", DeviceTokenSchema);
export default DeviceToken;
