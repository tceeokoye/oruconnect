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
    const { postId, content } = body;

    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Post ID and comment content are required' },
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

    const comment = await FeedInteraction.create({
      postId,
      userId,
      type: 'comment',
      content: content.trim(),
    });

    post.comments = (post.comments || 0) + 1;
    await post.save();

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
      comments: post.comments,
    });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}
