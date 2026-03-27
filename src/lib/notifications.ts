import Notification from "@/models/notification";

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
    // 1. Save to DB
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      refModel,
      relatedId,
    });

    // 2. Emit via socket.io (Internal Fetch)
    // We use absolute URL for server-side fetch. Use BASE_URL env or default to localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    await fetch(`${baseUrl}/api/socket/emit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new-notification",
        roomId: userId.toString(),
        data: notification,
      }),
    });

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}
