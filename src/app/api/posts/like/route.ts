import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import FeedInteraction from '@/models/feed-interaction';
import Post from '@/models/post';
import { extractUserId } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId, action } = body; // action: 'like' | 'unlike'

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user already liked this post
    const existingLike = await FeedInteraction.findOne({
      postId,
      userId,
      type: 'like',
    });

    if (action === 'like') {
      if (existingLike) {
        return NextResponse.json(
          { error: 'You already liked this post' },
          { status: 400 }
        );
      }

      await FeedInteraction.create({
        postId,
        userId,
        type: 'like',
      });

      post.likes = (post.likes || 0) + 1;
      await post.save();

      return NextResponse.json({
        success: true,
        message: 'Post liked successfully',
        likes: post.likes,
      });
    } else if (action === 'unlike') {
      if (!existingLike) {
        return NextResponse.json(
          { error: 'You have not liked this post' },
          { status: 400 }
        );
      }

      await FeedInteraction.deleteOne({ _id: existingLike._id });

      post.likes = Math.max(0, (post.likes || 0) - 1);
      await post.save();

      return NextResponse.json({
        success: true,
        message: 'Post unliked successfully',
        likes: post.likes,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating like:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update like' },
      { status: 500 }
    );
  }
}
