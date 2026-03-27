import mongoose, { Schema, model, models } from "mongoose";

const AdminSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  role: {
    type: String,
    enum: ["super_admin", "tech_admin", "disputes_admin", "content_admin", "finance_admin"],
    required: true
  },
  permissions: [{ type: String }], // Array of permission strings
  assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Super admin who assigned
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Define role-based permissions
export const ROLE_PERMISSIONS = {
  super_admin: [
    "manage_admins",
    "view_all_data",
    "modify_settings",
    "view_reports",
    "manage_disputes",
    "verify_providers",
    "manage_content",
    "manage_finance"
  ],
  tech_admin: [
    "verify_providers",
    "view_verification_requests",
    "approve_seller_onboarding",
    "manage_seller_documents"
  ],
  disputes_admin: [
    "view_disputes",
    "manage_disputes",
    "resolve_disputes",
    "view_dispute_evidence",
    "release_escrow"
  ],
  content_admin: [
    "view_posts",
    "approve_posts",
    "delete_posts",
    "flag_content",
    "manage_categories"
  ],
  finance_admin: [
    "view_transactions",
    "view_wallets",
    "view_reports",
    "manage_payouts",
    "view_platform_fees"
  ]
};

export default models.Admin || model("Admin", AdminSchema);
