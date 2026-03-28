import { type NextRequest, NextResponse } from "next/server";
import JobRequest from "@/models/job-request";
import Escrow from "@/models/escrow";
import Wallet from "@/models/wallet";
import Transaction from "@/models/transaction";
import connectToDB from "@/lib/db";
import { sendJobCompletionEmail } from "@/lib/email-service";
import User from "@/models/user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;

    const jobRequest = await JobRequest.findById(id)
      .populate("client")
      .populate("provider");

    if (!jobRequest) {
      return NextResponse.json(
        { message: "Job request not found" },
        { status: 404 }
      );
    }

    if (jobRequest.status !== "accepted") {
      return NextResponse.json(
        { message: "Job must be accepted before marking as completed" },
        { status: 400 }
      );
    }

    // Update job request status
    jobRequest.status = "completed";
    jobRequest.completedAt = new Date();
    jobRequest.totalAmount = jobRequest.budget || jobRequest.negotiatedBudget;
    await jobRequest.save();

    // Send completion email to client for certification
    const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/jobs/${jobRequest._id}/certify`;
    await sendJobCompletionEmail(
      jobRequest.client.email,
      jobRequest.client.firstName,
      jobRequest.provider.firstName,
      jobRequest.jobDescription,
      reviewLink
    );

    return NextResponse.json(
      {
        success: true,
        message: "Job marked as completed. Client will review and certify.",
        data: jobRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Complete job error:", error);
    return NextResponse.json(
      { message: "Failed to mark job as completed" },
      { status: 500 }
    );
  }
}
