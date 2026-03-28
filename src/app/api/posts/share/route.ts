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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      message: 'Post shared successfully',
      shares: post.shares,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${postId}`,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: error.message || 'Failed to share post' }, { status: 500 });
  }
}
