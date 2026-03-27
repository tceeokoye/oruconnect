import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "secret";
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        userId = decoded.userId;
      } catch (e) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Find the professional record mapped to this user
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      return NextResponse.json({ success: false, message: "Provider account not found" }, { status: 404 });
    }

    // Fetch all job requests sent to this provider
    const jobRequests = await prisma.jobRequest.findMany({
      where: { providerId: professional.id },
      include: {
        job: true,
        client: {
          select: { name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format the response to fit the frontend dashboard cards seamlessly
    const formattedJobs = jobRequests.map(req => ({
      id: req.id,
      title: req.job?.title || "Direct Request",
      client: req.client?.name || "Unknown Client",
      status: req.status, // "pending", "in_progress", "completed", "cancelled"
      budget: req.budget,
      dueDate: req.timeframe || req.job?.timeline || req.createdAt.toISOString(),
      description: req.jobDescription || req.job?.description || "No description provided",
      location: req.job?.location || "Remote/Unspecified",
      message: req.message,
    }));

    return NextResponse.json({ success: true, data: formattedJobs }, { status: 200 });

  } catch (error: any) {
    console.error("Provider Jobs Fetch Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
