import mongoose, { Schema, model, models } from "mongoose";

const NotificationPreferenceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    emailNotifications: {
      order: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      dispute: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      jobUpdate: { type: Boolean, default: true },
      rating: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    pushNotifications: {
      order: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      dispute: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      jobUpdate: { type: Boolean, default: true },
      rating: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    inAppNotifications: {
      order: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
      payment: { type: Boolean, default: true },
      dispute: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      jobUpdate: { type: Boolean, default: true },
      rating: { type: Boolean, default: true },
    },
    notificationFrequency: {
      type: String,
      enum: ["instant", "daily_digest", "weekly_digest"],
      default: "instant",
    },
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart: { type: String, default: "22:00" }, // HH:mm format
    quietHoursEnd: { type: String, default: "08:00" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NotificationPreferenceSchema.index({ userId: 1 });

export const NotificationPreference =
  models.NotificationPreference || model("NotificationPreference", NotificationPreferenceSchema);
export default NotificationPreference;
