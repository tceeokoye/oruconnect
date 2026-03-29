import { type NextRequest, NextResponse } from "next/server"
import MonifyService from "@/lib/monify-service"
import { prisma } from "@/lib/prisma"
import { sendPaymentConfirmationEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.reference || !body.jobRequestId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify payment with Monify
    const verifyResponse = await MonifyService.verifyPayment(body.reference)

    if (!verifyResponse.success) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      )
    }

    const totalAmount = verifyResponse.data.amount
    const platformFee = Math.round(totalAmount * 0.06)
    const providerAdvance = Math.round(totalAmount * 0.30)
    const remainingEscrow = totalAmount - platformFee - providerAdvance

    await prisma.$transaction(async (tx) => {
      // 1. Update transaction status
      const transaction = await tx.transaction.findUnique({
        where: { transactionId: body.reference }
      });

      if (transaction && transaction.status === "pending") {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "completed" }
        })
      }

      // 2. Get job request
      const jobRequest = await tx.jobRequest.findUnique({
        where: { id: body.jobRequestId },
        include: { client: true, provider: true } // Assuming provider links to Professional, but here it's User via Professional
      })

      if (jobRequest) {
        // 3. Create Escrow
        const escrow = await tx.escrow.create({
          data: {
            jobRequestId: body.jobRequestId,
            clientId: jobRequest.clientId,
            providerId: jobRequest.providerId,
            amount: remainingEscrow,
            platformFee,
            providerAdvance,
            status: "held",
            monifyReference: body.reference,
          }
        })

        // 4. Update Client Wallet
        await tx.wallet.upsert({
          where: { userId: jobRequest.clientId },
          update: { totalSpent: { increment: totalAmount } },
          create: {
            userId: jobRequest.clientId,
            availableBalance: 0,
            escrowBalance: 0,
            totalSpent: totalAmount,
            totalEarned: 0
          }
        })

        // 5. Send Email
        if (jobRequest.client) {
          await sendPaymentConfirmationEmail(
            jobRequest.client.email,
            jobRequest.client.name, // Prisma uses 'name'
            totalAmount,
            body.reference,
            jobRequest.jobDescription
          )
        }

        // 6. Notifications
        await tx.notification.create({
          data: {
            userId: jobRequest.clientId,
            content: JSON.stringify({
              type: 'payment',
              title: 'Payment successful',
              message: `Your payment of ₦${totalAmount} was successful.`,
              jobRequestId: jobRequest.id,
              escrowId: escrow.id
            }),
            isRead: false
          }
        });

        await tx.notification.create({
          data: {
            userId: jobRequest.providerId,
            content: JSON.stringify({
              type: 'payment',
              title: 'Payment deposited',
              message: `A payment of ₦${totalAmount} was deposited to your account.`,
              jobRequestId: jobRequest.id,
              escrowId: escrow.id
            }),
            isRead: false
          }
        });
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        data: verifyResponse.data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { message: "Payment verification failed" },
      { status: 500 })
  }
}
