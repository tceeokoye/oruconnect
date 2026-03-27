import mongoose, { Schema, model, models } from "mongoose";

const BusinessSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  categoryId: { type: String, required: true },
  subcategoryId: { type: String, default: null },
  state: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  nin: { type: String, required: true },
  verified: { type: Boolean, default: false }, // admin approval
  status: { type: String, default: "pending_verification" },
  owner: {
    id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
  },
}, { timestamps: true });

export default models.Business || model("Business", BusinessSchema);
