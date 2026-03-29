import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id }
    });

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

    const updatedJobRequest = await prisma.jobRequest.update({
      where: { id },
      data: {
        status: "rejected",
        respondedAt: new Date()
      }
    });

    return NextResponse.json(
      { success: true, message: "Job request rejected", data: updatedJobRequest },
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
