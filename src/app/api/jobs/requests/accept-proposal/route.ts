import { type NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/auth-middleware";
import { JobService } from "@/services/job.service";

async function acceptProposal(request: NextRequest, auth: any) {
  try {
    const body = await request.json();

    if (!body.proposalId) {
      return NextResponse.json(
        { success: false, message: "Proposal ID is required" },
        { status: 400 }
      );
    }

    const proposal = await JobService.acceptProposal(body.proposalId, auth.userId);

    return NextResponse.json(
      { success: true, message: "Proposal accepted successfully", data: proposal },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Accept proposal error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to accept proposal" },
      { status: error.message?.includes("not found") ? 404 : 400 }
    );
  }
}

export const POST = (req: NextRequest) => withRole(req, acceptProposal, ["USER", "SUPER_ADMIN", "OPERATIONS_ADMIN"]);
