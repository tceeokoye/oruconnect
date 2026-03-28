import { type NextRequest, NextResponse } from "next/server";
import JobRequest from "@/models/job-request";
import connectToDB from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await request.json();
    const { proposedBudget } = body;

    if (!proposedBudget) {
      return NextResponse.json(
        { message: "proposedBudget is required" },
        { status: 400 }
      );
    }

    const jobRequest = await JobRequest.findById(id);
    if (!jobRequest) {
      return NextResponse.json(
        { message: "Job request not found" },
        { status: 404 }
      );
    }

    if (jobRequest.status !== "pending" && jobRequest.status !== "negotiating") {
      return NextResponse.json(
        { message: "Cannot negotiate a request that has been resolved" },
        { status: 400 }
      );
    }

    jobRequest.status = "negotiating";
    jobRequest.negotiatedBudget = proposedBudget;
    jobRequest.updatedAt = new Date();
    await jobRequest.save();

    return NextResponse.json(
      {
        success: true,
        message: "Counter proposal sent",
        data: jobRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Negotiate job request error:", error);
    return NextResponse.json(
      { message: "Failed to send counter proposal" },
      { status: 500 }
    );
  }
}
