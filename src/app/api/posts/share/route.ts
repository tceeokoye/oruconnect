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
    const { postId } = body;

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

    // Check if user already shared this post
    const existingShare = await FeedInteraction.findOne({
      postId,
      userId,
      type: 'share',
    });

    if (existingShare) {
      return NextResponse.json(
        { error: 'You have already shared this post' },
        { status: 400 }
      );
    }

    await FeedInteraction.create({
      postId,
      userId,
      type: 'share',
    });

    post.shares = (post.shares || 0) + 1;
    await post.save();

    return NextResponse.json({
      success: true,
      message: 'Post shared successfully',
      shares: post.shares,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/posts/${postId}`,
    });
  } catch (error: any) {
    console.error('Error sharing post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share post' },
      { status: 500 }
    );
  }
}
