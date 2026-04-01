import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-middleware";

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const body = await request.json();
    const { serviceId, clientId, clientName, email, phone, budget, timeline, description } = body;

    const authClientId = auth.authenticated ? auth.user?.userId : null;
    const finalClientId = clientId || authClientId;

    if (!serviceId || !clientName || !email || !phone || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        serviceId,
        clientId: finalClientId,
        clientName,
        email,
        phone,
        budget,
        timeline,
        description,
      },
      include: {
        service: {
          include: {
            professional: true
          }
        }
      }
    });

    // Notify Provider
    if (newBooking.service?.professional?.userId) {
      await prisma.notification.create({
        data: {
          userId: newBooking.service.professional.userId,
          content: JSON.stringify({
            title: "New Service Booking",
            message: `${clientName} has booked your service: ${newBooking.service.title}`,
            type: "booking"
          }),
          isRead: false
        }
      });
    }

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user.userId;
    const role = auth.user.role;

    let whereClause = {};
    if (role === "PROFESSIONAL") {
      const professional = await prisma.professional.findUnique({
        where: { userId }
      });
      if (professional) {
        whereClause = { service: { professionalId: professional.id } };
      }
    } else {
      whereClause = { clientId: userId };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
