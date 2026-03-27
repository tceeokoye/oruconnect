import { type NextRequest, NextResponse } from "next/server"
import connectToDB from '@/lib/db'
import { createAndDeliverNotification } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.senderId || !body.recipientId || !body.message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (body.message.length > 5000) {
      return NextResponse.json({ message: "Message too long (max 5000 characters)" }, { status: 400 })
    }

    // Mock message creation
    const message = {
      id: `msg_${Date.now()}`,
      senderId: body.senderId,
      recipientId: body.recipientId,
      jobId: body.jobId,
      message: body.message,
      attachments: body.attachments || [],
      createdAt: new Date().toISOString(),
      read: false,
      }

      // Create in-app + delivery notifications for recipient
      try {
        await createAndDeliverNotification({
          userId: body.recipientId,
          type: 'message',
          title: 'New message',
          message: body.message.slice(0, 200),
          data: { messageId: message.id, senderId: body.senderId, jobId: body.jobId },
        })
      } catch (e) {
        console.warn('Failed to create delivery notification for message', e)
      }

      return NextResponse.json(
        {
          success: true,
          message: "Message sent",
          data: message,
        },
        { status: 201 },
      )
  } catch (error) {
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}
