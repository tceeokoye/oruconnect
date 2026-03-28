import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractUserId } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: 'Post ID and comment content are required' }, { status: 400 });
    }

    const post = await prisma.post.update({
        where: { id: postId },
        data: { comments: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      data: { content: content.trim(), userId }, // Echoes the comment back to the mapped UI component
      comments: post.comments,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: error.message || 'Failed to add comment' }, { status: 500 });
  }
}
