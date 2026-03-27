import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import JobRequest from "@/models/job-request";
import Job from "@/models/job";
import Escrow from "@/models/escrow";
import Dispute from "@/models/dispute";
import { withRole } from "@/lib/auth-middleware";

async function createDispute(request: NextRequest, auth: any) {
  try {
    await connectToDB();
    const body = await request.json();

    if (!body.jobId || !body.title || !body.description) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Find the Job
    const job = await Job.findById(body.jobId);
    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });
    }

    // Ensure user is client or provider
    const isClient = job.client?.toString() === auth.userId;
    const isProvider = job.provider?.toString() === auth.userId;

    if (!isClient && !isProvider) {
      return NextResponse.json({ success: false, message: "Unauthorized to dispute this job" }, { status: 403 });
    }

    const jobReq = await JobRequest.findOne({ jobId: job._id, status: { $in: ["accepted", "completed"] } });
    if (!jobReq) {
      return NextResponse.json({ success: false, message: "No active or recently completed proposal found" }, { status: 404 });
    }

    const escrow = await Escrow.findOne({ jobRequestId: jobReq._id });
    if (!escrow) {
      return NextResponse.json({ success: false, message: "Escrow not found" }, { status: 404 });
    }

    if (escrow.status === "completed" || escrow.status === "refunded") {
      return NextResponse.json({ success: false, message: "Cannot dispute a closed escrow" }, { status: 400 });
    }

    // Identify complainant and defendant
    const complainant = auth.userId;
    const defendant = isClient ? jobReq.provider : jobReq.client;

    const newDispute = new Dispute({
      jobRequestId: jobReq._id,
      escrowId: escrow._id,
      complainant,
      defendant,
      title: body.title,
      description: body.description,
      status: "open",
    });

    await newDispute.save();

    // Update escrow to disputed
    escrow.status = "disputed";
    await escrow.save();

    return NextResponse.json(
      { success: true, message: "Dispute raised successfully", data: newDispute },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create dispute error:", error);
    return NextResponse.json({ success: false, message: "Failed to create dispute" }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withRole(req, createDispute, ["client", "provider", "admin"]);
