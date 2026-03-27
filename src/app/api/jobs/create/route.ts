import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";

async function postHandler(request: NextRequest, auth: any) {
  try {
    const body = await request.json();

    // Input validation
    if (!body.title || !body.description || !body.category || !body.budget || !body.timeline || !body.location) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    // Generic job creation (Upwork style)
    const newJob = await prisma.job.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        budget: Number.parseFloat(body.budget),
        timeline: body.timeline,
        location: body.location,
        status: "open",
        clientId: auth.userId, 
        targetProviderId: body.targetProviderId || null,
      }
    });

    // If targeted, dispatch a direct JobRequest automatically
    if (body.targetProviderId) {
      await prisma.jobRequest.create({
        data: {
          jobId: newJob.id,
          clientId: auth.userId,
          providerId: body.targetProviderId,
          budget: Number.parseFloat(body.budget),
          jobDescription: body.description,
          timeframe: body.timeline,
          status: "pending",
          message: body.message || "Direct job request from client."
        }
      });
    }

    return NextResponse.json(
      { success: true, message: "Job posted successfully", job: newJob },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withRole(req, postHandler, ["USER", "SUPER_ADMIN"]);
