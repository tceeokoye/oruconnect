import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";

async function updateNotification(request: NextRequest, auth: any, params: any) {
  try {
    const userId = auth.userId;
    const { id } = params;

    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });

    if (result.count === 0) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification error:", error);
    return NextResponse.json({ message: "Failed to mark notification" }, { status: 500 });
  }
}

async function removeNotification(request: NextRequest, auth: any, params: any) {
  try {
    const userId = auth.userId;
    const { id } = params;

    const result = await prisma.notification.deleteMany({
      where: { id, userId }
    });

    if (result.count === 0) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ message: "Failed to delete notification" }, { status: 500 });
  }
}

export const PUT = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  return withAuth(req, (r, a) => updateNotification(r, a, resolvedParams));
};

export const DELETE = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  return withAuth(req, (r, a) => removeNotification(r, a, resolvedParams));
};
