import { type NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import { Conversation } from '@/models/message';
import { withAuth } from '@/lib/auth-middleware';

async function getConversations(request: NextRequest, auth: any) {
  try {
    await connectToDB();

    const userId = auth.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) => withAuth(req, getConversations);
