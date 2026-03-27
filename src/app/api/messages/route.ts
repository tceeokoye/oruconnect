import { type NextRequest, NextResponse } from "next/server";
import { Message, Conversation } from "@/models/message";
import User from "@/models/user";
import connectToDB from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const url = new URL(request.url);
    const conversationId = url.searchParams.get("conversationId");
    const userId = url.searchParams.get("userId");
    const recipientId = url.searchParams.get("recipientId");

    if (conversationId) {
      // Get messages for specific conversation
      const messages = await Message.find({ conversationId })
        .populate("sender", "firstName lastName profilePhoto")
        .populate("recipient", "firstName lastName profilePhoto")
        .sort({ createdAt: 1 });

      return NextResponse.json(
        { success: true, data: messages },
        { status: 200 }
      );
    } else if (userId) {
      // Get conversations for user
      const conversations = await Conversation.find({
        participants: userId,
      })
        .populate("participants", "firstName lastName profilePhoto email")
        .sort({ lastMessageAt: -1 });

      return NextResponse.json(
        { success: true, data: conversations },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Missing required parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const {
      sender,
      recipient,
      content,
      conversationId,
      relatedJobRequestId,
      attachments,
    } = body;

    if (!sender || !recipient || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let conversation: any = null;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      // Find or create conversation
      conversation = await Conversation.findOne({
        participants: {
          $all: [sender, recipient],
        },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [sender, recipient],
          relatedJobRequestId,
        });
        await conversation.save();
      }
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender,
      recipient,
      content,
      attachments,
      read: false,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Send in-app notification to recipient
    const senderUser = await User.findById(sender).select("firstName");
    await sendNotification({
      userId: recipient,
      type: "message",
      title: "New Message",
      message: `${senderUser?.firstName || 'Someone'} sent you a message.`,
      refModel: "Message",
      relatedId: message._id.toString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        data: message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
