import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import { createAndDeliverNotification } from "@/lib/notification-service";
import { extractUserId } from "@/lib/validation";

// Dev helper to create notification (use with care) -- POST { userId, type, title, message }
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    // allow admin or dev only? For simplicity in dev allow when ENV=development
    if (process.env.NODE_ENV !== 'development') {
      const uid = extractUserId(request);
      // require admin role check in production
      if (!uid) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, type, title, message, data } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const notif = await createAndDeliverNotification({ userId, type, title, message, data });

    return NextResponse.json({ success: true, data: notif });
  } catch (error) {
    console.error('Create notification error', error);
    return NextResponse.json({ message: 'Failed to create notification' }, { status: 500 });
  }
}
