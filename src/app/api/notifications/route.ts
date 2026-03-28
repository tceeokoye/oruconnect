import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-middleware";

async function getNotifications(request: NextRequest, auth: any) {
  try {
    const userId = auth.userId;

    const page = request.nextUrl.searchParams.get("page") || "1";
    const limit = request.nextUrl.searchParams.get("limit") || "10";
    const isRead = request.nextUrl.searchParams.get("isRead");

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };
    if (isRead !== null) {
      whereClause.isRead = isRead === "true";
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where: whereClause }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    const mappedNotifications = notifications.map((n: any) => {
      let parsed = { title: "Platform Update", type: "system", message: n.content };
      
      try {
        const decoded = JSON.parse(n.content);
        if (decoded.title && decoded.message) {
          parsed = decoded;
        }
      } catch (e) {
        // Fallback for legacy raw string notifications
      }

      return {
        _id: n.id,
        title: parsed.title,
        message: parsed.message,
        type: parsed.type,
        isRead: n.isRead,
        createdAt: n.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      data: mappedNotifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      unreadCount,
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { message: "Failed to fetch notifications", error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) => withAuth(req, getNotifications);
