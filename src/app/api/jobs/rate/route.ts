import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Rating from "@/models/rating";
import User from "@/models/user";
import JobRequest from "@/models/job-request";
import { withRole } from "@/lib/auth-middleware";
import { sendNotification } from "@/lib/notifications";

async function rateProvider(request: NextRequest, auth: any) {
  try {
    await connectToDB();
    const body = await request.json();
    const { jobRequestId, ratedUser, rating, review, communication, quality, timeliness } = body;

    if (!jobRequestId || !ratedUser || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify job is completed
    const jobReq = await JobRequest.findById(jobRequestId);
    if (!jobReq || jobReq.status !== "completed") {
      return NextResponse.json(
        { success: false, message: "Can only rate after job completion" },
        { status: 400 }
      );
    }

    // Check if already rated
    const existing = await Rating.findOne({ jobRequestId, ratedBy: auth.userId });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already rated this job" },
        { status: 400 }
      );
    }

    const newRating = new Rating({
      jobRequestId,
      ratedBy: auth.userId,
      ratedUser,
      rating,
      review,
      communication,
      quality,
      timeliness,
    });
    await newRating.save();

    // Recalculate average rating for provider
    const allRatings = await Rating.find({ ratedUser });
    const totalScore = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const average = totalScore / allRatings.length;

    await User.updateOne(
      { _id: ratedUser },
      {
        $set: { rating: parseFloat(average.toFixed(1)), ratingCount: allRatings.length },
      }
    );

    // Notify provider
    const client = await User.findById(auth.userId).select("firstName");
    await sendNotification({
      userId: ratedUser,
      type: "rating",
      title: "New Review Received",
      message: `${client?.firstName || "A client"} gave you a ${rating}-star rating!`,
      refModel: "Rating",
      relatedId: newRating._id.toString(),
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
