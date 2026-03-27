import { type NextRequest, NextResponse } from "next/server";
import { withAdminPermission } from "@/lib/auth-middleware";

async function getHandler(request: NextRequest) {
  try {
    // Mock disputes list
    const disputes = [
      {
        id: "1",
        jobTitle: "House Electrical Rewiring",
        client: "John Doe",
        provider: "ElectroWorks Pro",
        amount: 45000,
        raisedDate: "2026-01-08",
        status: "open",
        reason: "Work not completed",
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: disputes,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch disputes" }, { status: 500 })
  }
}

export const GET = (req: NextRequest) => withAdminPermission(req, getHandler, ["view_disputes"]);
