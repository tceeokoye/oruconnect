import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import HelpTicket from '@/models/help-ticket';
import { extractUserId } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const ticket = await HelpTicket.findById(params.id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Help ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this ticket' },
        { status: 403 }
      );
    }

    ticket.messages.push({
      _id: new Date(),
      sender: userId,
      senderRole: 'client',
      message: message.trim(),
      sentAt: new Date(),
    });

    ticket.status = 'waiting_for_response';
    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Message added successfully',
      data: ticket,
    });
  } catch (error: any) {
    console.error('Error adding message to help ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add message' },
      { status: 500 }
    );
  }
}
