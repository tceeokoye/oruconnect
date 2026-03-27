import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema({
  provider: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  category: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["published", "pending_approval", "approved", "rejected", "archived"],
    default: "pending_approval"
  },
  rejectionReason: { type: String, default: null },
  isHidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Post || model("Post", PostSchema);
