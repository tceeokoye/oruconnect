import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendJobRequestEmail, emailTemplates } from "@/lib/email-service";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: providerId } = await params;
    const body = await request.json();
    const { clientId, name, email, phone, budget, description, timeline } = body;

    // 1. Find the provider
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      include: { profile: true }
    });

    if (!provider) {
      return NextResponse.json({ message: "Provider not found" }, { status: 404 });
    }

    // 2. Determine client name for notification/email
    let clientName = name || "A potential client";
    if (clientId) {
      const client = await prisma.user.findUnique({ where: { id: clientId } });
      if (client) clientName = client.name;
    }

    // 3. Send in-app notification
    await sendNotification({
      userId: providerId,
      type: "order",
      title: "New Service Inquiry",
      message: `${clientName} has requested your service: "${description.substring(0, 50)}..."`,
      data: { 
        inquiry: { name, email, phone, budget, description, timeline },
        source: "public_profile"
      }
    });

    // 4. Send email to provider
    // Using existing template for now or a custom subject
    await sendJobRequestEmail(
      provider.email,
      provider.name,
      clientName,
      `Service Inquiry: ${description.substring(0, 30)}...`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications`
    );

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been sent to the provider successfully."
    }, { status: 201 });

  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json({ message: "An error occurred while sending your inquiry." }, { status: 500 });
  }
}
