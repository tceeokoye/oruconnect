import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedInteraction extends Document {
  _id: string;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'share';
  content?: string; // For comments
  commentsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  replies?: Array<{
    _id: string;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    likes: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const FeedInteractionSchema = new Schema<IFeedInteraction>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'share'],
      required: true,
    },
    content: String,
    commentsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    replies: [
      {
        _id: Schema.Types.ObjectId,
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        likes: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes
FeedInteractionSchema.index({ postId: 1, type: 1 });
FeedInteractionSchema.index({ userId: 1, createdAt: -1 });
FeedInteractionSchema.index({ postId: 1, userId: 1 });

export default mongoose.models.FeedInteraction ||
  mongoose.model<IFeedInteraction>('FeedInteraction', FeedInteractionSchema);
