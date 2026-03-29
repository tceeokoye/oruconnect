import { type NextRequest, NextResponse } from "next/server"
import MonifyService from "@/lib/monify-service"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.amount || !body.email || !body.jobRequestId || !body.userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }
    
    // Validate amount
    if (body.amount < 1000) {
      return NextResponse.json({ message: "Minimum amount is ₦1,000" }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    })
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Initialize payment with Monify
    const monifyResponse = await MonifyService.initializePayment({
      amount: body.amount,
      email: body.email,
      firstName: user.name, // Prisma uses 'name' not 'firstName'
      lastName: "", // Handle split name if needed, but Monify handles it
      reference: `ORU_${body.jobRequestId}_${Date.now()}`,
      metadata: {
        jobRequestId: body.jobRequestId,
        userId: body.userId,
      },
      channels: ["card", "bank", "ussd", "qr"],
    })

    if (!monifyResponse.success) {
      return NextResponse.json(
        { message: monifyResponse.error },
        { status: 400 }
      )
    }

    // Create pending transaction record
    await prisma.transaction.create({
      data: {
        transactionId: monifyResponse.data.reference,
        type: "debit",
        userId: body.userId,
        amount: body.amount,
        status: "pending",
        description: `Payment for job request: ${body.jobRequestId}`,
        paymentReference: monifyResponse.data.reference,
        paymentMethod: "card",
        jobRequestId: body.jobRequestId, // Ensure this is saved for the webhook
      }
    });

    // Return payment initialization response
    return NextResponse.json(
      {
        success: true,
        message: "Payment session created",
        data: {
          reference: monifyResponse.data.reference,
          accessCode: monifyResponse.accessCode,
          authorizationUrl: monifyResponse.authorizationUrl,
          amount: body.amount,
          currency: "NGN",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ message: "Failed to initialize payment" }, { status: 500 })
  }
}
