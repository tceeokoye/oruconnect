import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";

async function rateProvider(request: NextRequest, auth: any) {
  try {
    const body = await request.json();
    const { jobRequestId, ratedUser, rating, review } = body;

    if (!jobRequestId || !ratedUser || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify job is completed
    const jobReq = await prisma.jobRequest.findUnique({
      where: { id: jobRequestId }
    });
    
    if (!jobReq || jobReq.status !== "completed") {
      return NextResponse.json(
        { success: false, message: "Can only rate after job completion" },
        { status: 400 }
      );
    }

    // Check if already rated
    const existing = await prisma.rating.findFirst({
      where: { jobRequestId, clientId: auth.userId }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already rated this job" },
        { status: 400 }
      );
    }

    const newRating = await prisma.rating.create({
      data: {
        jobRequestId,
        clientId: auth.userId,
        providerId: ratedUser,
        rating,
        review,
      }
    });

    // Notify provider
    const client = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true }
    });

    await prisma.notification.create({
      data: {
        userId: ratedUser,
        content: JSON.stringify({
          type: "rating",
          title: "New Review Received",
          message: `${client?.name || "A client"} gave you a ${rating}-star rating!`,
          jobRequestId,
          ratingId: newRating.id
        }),
        isRead: false
      }
    });

    return NextResponse.json(
      { success: true, message: "Rating submitted successfully", data: newRating },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rate provider error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

export const POST = (req: NextRequest) => withRole(req, rateProvider, ["client"]);
