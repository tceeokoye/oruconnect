import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import HelpTicket from '@/models/help-ticket';
import { validateCreateHelpTicket } from '@/lib/validation';
import { extractUserId } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const tickets = await HelpTicket.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error('Error fetching help tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help tickets' },
      { status: 500 }
    );
  }
}

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
    const validation = validateCreateHelpTicket.parse(body);

    const ticket = new HelpTicket({
      userId,
      title: validation.title,
      description: validation.description,
      category: validation.category,
      priority: validation.priority,
      status: 'open',
      messages: [
        {
          _id: new Date(),
          sender: userId,
          senderRole: 'client',
          message: validation.description,
          sentAt: new Date(),
        },
      ],
    });

    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Help ticket created successfully',
      data: ticket,
    });
  } catch (error: any) {
    console.error('Error creating help ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create help ticket' },
      { status: 500 }
    );
  }
}
