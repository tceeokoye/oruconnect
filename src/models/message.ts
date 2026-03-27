import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: String, required: true }, // Changed to String to support PostgreSQL UUIDs
  recipient: { type: String, required: true }, // Changed to String
  content: { type: String, required: true },
  attachments: [{ type: String }],
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema({
  participants: [{ type: String, required: true }], // Changed from ObjectId to support PostgreSQL Users
  relatedJobRequestId: { type: String, default: null },
  lastMessage: { type: String, default: null },
  lastMessageAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Message = models.Message || model("Message", MessageSchema);
export const Conversation = models.Conversation || model("Conversation", ConversationSchema);
