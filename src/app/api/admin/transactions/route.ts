import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminPermission } from "@/lib/auth-middleware";

export async function GET(request: NextRequest, auth: any) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const type = url.searchParams.get("type") || "all";

    let query: any = {};
    if (type !== "all") {
      query.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where: query,
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json(
      { success: true, data: transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export const GET_ROUTED = (req: NextRequest) => withAdminPermission(req, GET, ["SUPER_ADMIN", "OPERATIONS_ADMIN"]);
