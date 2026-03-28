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
    const { postId, action } = body;

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action required' }, { status: 400 });
    }

    const incrementValue = action === 'like' ? 1 : -1;

    const post = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: incrementValue } }
    });

    // Ensure likes do not drop below zero conceptually (handled cleanly if already synced)
    if (post.likes < 0) {
      await prisma.post.update({ where: { id: postId }, data: { likes: 0 }});
      post.likes = 0;
    }

    return NextResponse.json({
      success: true,
      message: `Post ${action}d successfully`,
      likes: post.likes,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    console.error('Error updating like:', error);
    return NextResponse.json({ error: error.message || 'Failed to update like' }, { status: 500 });
  }
}
