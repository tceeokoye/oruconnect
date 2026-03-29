import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendJobCompletionEmail } from "@/lib/email-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id },
      include: { client: true, provider: { include: { user: true } } }
    });

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

    const updatedJobRequest = await prisma.jobRequest.update({
      where: { id },
      data: {
        status: "completed",
        // Note: completedAt and totalAmount might not precisely exist in Prisma JobRequest
        // based on the schema, but you can set status.
      }
    });

    // Send completion email to client for certification
    if (jobRequest.client) {
      const reviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/jobs/${jobRequest.id}/certify`;
      const providerName = jobRequest.provider?.name || "Provider";

      await sendJobCompletionEmail(
        jobRequest.client.email,
        jobRequest.client.name, // Prisma uses 'name'
        providerName,
        jobRequest.jobDescription,
        reviewLink
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job marked as completed. Client will review and certify.",
        data: updatedJobRequest,
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
