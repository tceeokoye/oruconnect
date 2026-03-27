import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Job from "@/models/job";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Fetch jobs, populate client details
    const jobs = await Job.find(query)
      .populate("client", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: jobs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
