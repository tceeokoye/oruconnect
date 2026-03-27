import { type NextRequest, NextResponse } from "next/server";
import JobRequest from "@/models/job-request";
import Job from "@/models/job";
import connectToDB from "@/lib/db";
import { sendJobRequestEmail } from "@/lib/email-service";
import User from "@/models/user";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const {
      jobId,
      clientId,
      jobDescription,
      timeframe,
      budget,
      message,
      attachments,
    } = body;

    if (!jobId || !clientId || !jobDescription || !timeframe) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get job and provider info
    const job = await Job.findById(jobId).populate("provider");
    if (!job) {
      return NextResponse.json(
        { message: "Job not found" },
        { status: 404 }
      );
    }

    // Get client info
    const client = await User.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Create job request
    const jobRequest = new JobRequest({
      jobId,
      client: clientId,
      provider: job.provider._id,
      jobDescription,
      timeframe,
      budget: job.priceType === "fixed" ? job.fixedPrice : budget,
      message,
      attachments,
      status: "pending",
    });

    await jobRequest.save();

    // Send email to provider
    const requestLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/jobs/${jobRequest._id}`;
    await sendJobRequestEmail(
      job.provider.email,
      job.provider.firstName,
      client.firstName,
      job.title,
      requestLink
    );

    // Send in-app notification
    await sendNotification({
      userId: job.provider._id.toString(),
      type: "order",
      title: "New Job Request",
      message: `${client.firstName} has requested your service for "${job.title}".`,
      refModel: "JobRequest",
      relatedId: jobRequest._id.toString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job request created successfully",
        data: jobRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create job request error:", error);
    return NextResponse.json(
      { message: "Failed to create job request" },
      { status: 500 }
    );
  }
}
