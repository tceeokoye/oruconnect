import { type NextRequest, NextResponse } from "next/server"
import MonifyService from "@/lib/monify-service"
import connectToDB from "@/lib/db"
import Transaction from "@/models/transaction"
import User from "@/models/user"

export async function POST(request: NextRequest) {
  try {
    await connectToDB()
    
    const body = await request.json()
    if (!body.amount || !body.email || !body.jobRequestId || !body.userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }
    
    // Validate amount
    if (body.amount < 1000) {
      return NextResponse.json({ message: "Minimum amount is ₦1,000" }, { status: 400 })
    }

    // Get user details
    const user = await User.findById(body.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Initialize payment with Monify
    const monifyResponse = await MonifyService.initializePayment({
      amount: body.amount,
      email: body.email,
      firstName: user.firstName,
      lastName: user.lastName,
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
    const transaction = new Transaction({
      transactionId: monifyResponse.data.reference,
      type: "debit",
      userId: body.userId,
      amount: body.amount,
      status: "pending",
      description: `Payment for job request: ${body.jobRequestId}`,
      paymentReference: monifyResponse.data.reference,
      paymentMethod: "card",
      jobRequestId: body.jobRequestId, // Ensure this is saved for the webhook
    })

    await transaction.save()

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
