import mongoose, { Schema, Document } from 'mongoose';

export interface IHelpTicket extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'technical' | 'payment' | 'account' | 'dispute' | 'job' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_client' | 'resolved' | 'closed';
  assignedToAdmin?: mongoose.Types.ObjectId;
  transferredToTechAdmin?: boolean;
  attachments: Array<{
    _id: string;
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  messages: Array<{
    _id: string;
    sender: mongoose.Types.ObjectId;
    senderRole: 'client' | 'admin' | 'tech_admin';
    message: string;
    attachments?: Array<{
      url: string;
      filename: string;
    }>;
    sentAt: Date;
  }>;
  resolvedBy?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  relatedJobRequestId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const HelpTicketSchema = new Schema<IHelpTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['technical', 'payment', 'account', 'dispute', 'job', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_for_client', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    assignedToAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    transferredToTechAdmin: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        _id: Schema.Types.ObjectId,
        url: String,
        filename: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    messages: [
      {
        _id: Schema.Types.ObjectId,
        sender: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        senderRole: {
          type: String,
          enum: ['client', 'admin', 'tech_admin'],
          default: 'client',
        },
        message: {
          type: String,
          required: true,
        },
        attachments: [
          {
            url: String,
            filename: String,
          },
        ],
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    resolutionNotes: String,
    relatedJobRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'JobRequest',
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Indexes for better query performance
HelpTicketSchema.index({ userId: 1, status: 1 });
HelpTicketSchema.index({ assignedToAdmin: 1, status: 1 });
HelpTicketSchema.index({ category: 1, priority: 1 });
HelpTicketSchema.index({ createdAt: -1 });

export default mongoose.models.HelpTicket ||
  mongoose.model<IHelpTicket>('HelpTicket', HelpTicketSchema);
