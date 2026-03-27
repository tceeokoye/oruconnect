import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["order", "message", "payment", "dispute", "system", "job_update", "rating"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    deliveryMethods: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: "refModel",
      default: null,
    },
    refModel: {
      type: String,
      enum: ["Order", "Message", "Payment", "Dispute", "Job", "Rating"],
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
