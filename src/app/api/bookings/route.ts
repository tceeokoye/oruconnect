import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, clientId, clientName, email, phone, budget, timeline, description } = body;

    if (!serviceId || !clientName || !email || !phone || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        serviceId,
        clientId, // can be null if guest
        clientName,
        email,
        phone,
        budget,
        timeline,
        description,
      },
    });

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // In a real scenario, we would use NextAuth to get the current user ID
    // and filter bookings by that user (if they are a client) or professional.
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        client: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
