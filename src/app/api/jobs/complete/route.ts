import { type NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/auth-middleware";
import { JobService } from "@/services/job.service";

async function completeJob(request: NextRequest, auth: any) {
  try {
    const body = await request.json();

    if (!body.jobId) {
      return NextResponse.json({ success: false, message: "Job ID is required" }, { status: 400 });
    }

    await JobService.completeJob(body.jobId, auth.userId);

    return NextResponse.json(
      { success: true, message: "Job completed and escrow released to provider" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Complete job error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to complete job" },
      { status: error.message?.includes("not found") ? 404 : 400 }
    );
  }
}

export const POST = (req: NextRequest) => withRole(req, completeJob, ["USER"]);
