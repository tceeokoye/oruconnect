import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { proposedBudget } = body;

    if (!proposedBudget) {
      return NextResponse.json(
        { message: "proposedBudget is required" },
        { status: 400 }
      );
    }

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id }
    });

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

    const updatedJobRequest = await prisma.jobRequest.update({
      where: { id },
      data: {
        status: "negotiating",
        negotiatedBudget: proposedBudget,
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Counter proposal sent",
        data: updatedJobRequest,
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
