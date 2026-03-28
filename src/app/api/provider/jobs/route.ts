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

    // Fetch Bookings tied directly to the provider's services
    const bookings = await prisma.booking.findMany({
      where: { service: { professionalId: professional.id } },
      include: {
        service: true,
        client: {
          select: { name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedRequests = jobRequests.map((req: any) => ({
      id: req.id,
      title: req.job?.title || "Direct Request",
      client: req.client?.name || "Unknown Client",
      status: req.status === "in_progress" ? "in_progress" : req.status === "pending" ? "pending" : req.status === "completed" ? "completed" : "cancelled",
      budget: req.budget,
      dueDate: req.timeframe || req.job?.timeline || req.createdAt.toISOString(),
      description: req.jobDescription || req.job?.description || "No description provided",
      location: req.job?.location || "Remote/Unspecified",
      message: req.message,
      createdAt: req.createdAt,
      type: "job_request"
    }));

    const formattedBookings = bookings.map((b: any) => ({
      id: b.id,
      title: b.service?.title || "Direct Service Booking",
      client: b.clientName || b.client?.name || "Unknown Client",
      status: b.status === "CONFIRMED" ? "in_progress" : b.status === "COMPLETED" ? "completed" : b.status === "PENDING" ? "pending" : "cancelled",
      budget: b.budget || b.service?.priceRange?.split("-")[0]?.replace(/[^0-9]/g, '') || "0",
      dueDate: b.timeline || b.createdAt.toISOString(),
      description: b.description || "No description provided",
      location: "Remote/Unspecified", // Direct Bookings don't strictly track location structurally
      message: b.description,
      createdAt: b.createdAt,
      type: "booking"
    }));

    // Merge both arrays and sort descending
    const mergedJobs = [...formattedRequests, ...formattedBookings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, data: mergedJobs }, { status: 200 });

  } catch (error: any) {
    console.error("Provider Jobs Fetch Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
