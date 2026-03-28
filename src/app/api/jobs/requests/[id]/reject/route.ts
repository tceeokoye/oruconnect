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
    const { reason } = body;

    const jobRequest = await JobRequest.findById(id);
    if (!jobRequest) {
      return NextResponse.json(
        { message: "Job request not found" },
        { status: 404 }
      );
    }

    if (jobRequest.status !== "pending") {
      return NextResponse.json(
        { message: "Cannot reject a request that has already been responded to" },
        { status: 400 }
      );
    }

    jobRequest.status = "rejected";
    jobRequest.respondedAt = new Date();
    await jobRequest.save();

    return NextResponse.json(
      { success: true, message: "Job request rejected", data: jobRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject job request error:", error);
    return NextResponse.json(
      { message: "Failed to reject job request" },
      { status: 500 }
    );
  }
}
