import { prisma } from "@/lib/prisma";

export async function sendNotification({
  userId,
  type,
  title,
  message,
  data = null,
  refModel = null,
  relatedId = null,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  refModel?: string | null;
  relatedId?: string | null;
}) {
  try {
    // 1. Save to DB using Prisma
    const contentObj = { type, title, message, data, refModel, relatedId };
    const notification = await prisma.notification.create({
      data: {
        userId,
        content: JSON.stringify(contentObj),
        isRead: false
      }
    });

    // 2. Emit via socket.io (Internal Fetch)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // We intentionally don't await this if we want fire-and-forget, but it's safe to await here.
    await fetch(`${baseUrl}/api/socket/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new-notification",
        roomId: userId.toString(),
        data: {
          ...notification,
          title,  // Extracted for the socket payload
          message // Extracted for the socket payload
        },
      }),
    }).catch(err => console.error("Socket emit failed", err));

    return notification;
  } catch (error) {
    console.error("Failed to send notification via Prisma:", error);
    return null;
  }
}
