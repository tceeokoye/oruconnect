import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import HelpTicket from '@/models/help-ticket';
import Admin from '@/models/admin';
import { createAndDeliverNotification } from '@/lib/notification-service';
import { extractUserId } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const adminId = extractUserId(request);
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin has permission to transfer
    const admin = await Admin.findOne({ userId: adminId });
    if (!admin || (admin.role !== 'super_admin' && admin.role !== 'disputes_admin')) {
      return NextResponse.json(
        { error: 'Not authorized to transfer tickets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    const ticket = await HelpTicket.findById((await params).id);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Help ticket not found' },
        { status: 404 }
      );
    }

    // Find a tech admin to assign
    const techAdmin = await Admin.findOne({ role: 'tech_admin', status: 'active' });
    if (!techAdmin) {
      return NextResponse.json(
        { error: 'No tech admin available' },
        { status: 400 }
      );
    }

    // Update ticket
    ticket.transferredToTechAdmin = true;
    ticket.assignedToAdmin = techAdmin.userId;
    ticket.messages.push({
      _id: new Date(),
      sender: adminId,
      senderRole: 'admin',
      message: `Transferred to Tech Admin: ${reason}`,
      sentAt: new Date(),
    });

    await ticket.save();

    // Notify the tech admin
    try {
      await createAndDeliverNotification({
        userId: techAdmin.userId,
        type: 'help_ticket',
        title: 'Help ticket transferred',
        message: `A ticket has been transferred to you: ${ticket.title || ticket._id}`,
        data: { ticketId: ticket._id },
      })
    } catch (e) {
      console.warn('Failed to notify tech admin about ticket transfer', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket transferred to Tech Admin successfully',
      data: ticket,
    });
  } catch (error: any) {
    console.error('Error transferring ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transfer ticket' },
      { status: 500 }
    );
  }
}
