import { type NextRequest, NextResponse } from "next/server";
import { withAdminPermission } from "@/lib/auth-middleware";

async function getHandler(request: NextRequest) {
  try {
    // Mock admin stats
    const stats = {
      pendingVerifications: 12,
      totalBusinesses: 50000,
      activeJobs: 248,
      disputes7days: 8,
      totalEscrowValue: 5000000000,
      completionRate: 96.5,
      averageResponseTime: "2.3 hours",
      activeUsers: 125000,
    }

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 })
  }
}

export const GET = (req: NextRequest) => withAdminPermission(req, getHandler, ["view_reports"]);
