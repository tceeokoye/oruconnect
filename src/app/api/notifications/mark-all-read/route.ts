import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";

async function markAllRead(request: NextRequest, auth: any) {
  try {
    const userId = auth.userId;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { message: "Failed to mark all as read", error: error.message },
      { status: 500 }
    );
  }
}

export const POST = (req: NextRequest) => withAuth(req, markAllRead);
