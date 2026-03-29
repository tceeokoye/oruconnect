import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

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

    const body = await request.json();
    const { action, type } = body;

    if (!action || !["accept", "decline", "complete"].includes(action)) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    // Determine the status mapping
    let newReqStatus = "";
    let newBookingStatus = "";

    if (action === "accept") {
      newReqStatus = "in_progress";
      newBookingStatus = "CONFIRMED";
    } else if (action === "decline") {
      newReqStatus = "cancelled";
      newBookingStatus = "CANCELLED";
    } else if (action === "complete") {
      newReqStatus = "completed";
      newBookingStatus = "COMPLETED";
    }

    let clientIdToNotify = "";
    let jobTitle = "";
    let providerName = "";

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { professional: true } });

    if (!user || !user.professional) {
        return NextResponse.json({ success: false, message: "Provider not found" }, { status: 404 });
    }

    providerName = user.professional.name;

    if (type === "job_request") {
      const jobReq = await prisma.jobRequest.findUnique({
        where: { id },
        include: { job: true }
      });

      if (!jobReq) {
        return NextResponse.json({ success: false, message: "Job Request not found" }, { status: 404 });
      }

      await prisma.jobRequest.update({
        where: { id },
        data: { status: newReqStatus }
      });

      clientIdToNotify = jobReq.clientId;
      jobTitle = jobReq.job?.title || "Direct Request";

    } else if (type === "booking") {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { service: true }
      });

      if (!booking) {
        return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
      }

      await prisma.booking.update({
        where: { id },
        data: { status: newBookingStatus as any }
      });

      if (booking.clientId) {
        clientIdToNotify = booking.clientId;
      }
      jobTitle = booking.service?.title || "Direct Booking";
    } else {
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
    }

    // Create Notification using Prisma notification model
    if (clientIdToNotify && action !== "complete") {
        const actionText = action === "accept" ? "accepted" : "declined";
        await prisma.notification.create({
            data: {
                userId: clientIdToNotify,
                content: JSON.stringify({
                    title: `Job ${action === "accept" ? "Accepted" : "Declined"}`,
                    message: `${providerName} has ${actionText} your job: ${jobTitle}`,
                    type: "system"
                }),
                isRead: false
            }
        });
    }

    return NextResponse.json({ success: true, message: `Job successfully ${action}ed` }, { status: 200 });
  } catch (error: any) {
    console.error("Update Job Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
