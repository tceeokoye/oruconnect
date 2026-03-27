import { type NextRequest, NextResponse } from "next/server"
import MonifyService from "@/lib/monify-service"
import connectToDB from "@/lib/db"
import Transaction from "@/models/transaction"
import Wallet from "@/models/wallet"
import Escrow from "@/models/escrow"
import JobRequest from "@/models/job-request"
import { sendPaymentConfirmationEmail } from "@/lib/email-service"
import User from "@/models/user"
import { createAndDeliverNotification } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    await connectToDB()
    
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

    // Update transaction status
    const transaction = await Transaction.findOne({
      transactionId: body.reference,
    })

    if (transaction) {
      transaction.status = "completed"
      await transaction.save()
    }

    // Get job request and create escrow
    const jobRequest = await JobRequest.findById(body.jobRequestId)
      .populate("client")
      .populate("provider")

    if (jobRequest) {
      const totalAmount = verifyResponse.data.amount
      const platformFee = Math.round(totalAmount * 0.06)
      const providerAdvance = Math.round(totalAmount * 0.30)

      // Create escrow
      const escrow = new Escrow({
        jobRequestId: body.jobRequestId,
        client: jobRequest.client._id,
        provider: jobRequest.provider._id,
        amount: totalAmount,
        platformFee,
        providerAdvance,
        status: "held",
        monifyReference: body.reference,
      })

      await escrow.save()

      // Update wallets
      let clientWallet = await Wallet.findOne({ userId: jobRequest.client._id })
      if (!clientWallet) {
        clientWallet = new Wallet({ userId: jobRequest.client._id })
      }
      clientWallet.lockedBalance += totalAmount
      await clientWallet.save()

      // Send confirmation email
      const user = await User.findById(jobRequest.client._id)
      if (user) {
        await sendPaymentConfirmationEmail(
          user.email,
          user.firstName,
          totalAmount,
          body.reference,
          jobRequest.jobDescription
        )
      }
      // notify client (payer) and provider (payee)
      try {
        await createAndDeliverNotification({
          userId: jobRequest.client._id.toString(),
          type: 'payment',
          title: 'Payment received',
          message: `Your payment of ₦${totalAmount} was successful.`,
          data: { jobRequestId: jobRequest._id, escrowId: escrow._id },
        })
      } catch (e) {
        console.warn('Failed to notify client about payment', e)
      }

      try {
        await createAndDeliverNotification({
          userId: jobRequest.provider._id.toString(),
          type: 'payment',
          title: 'Payment deposited',
          message: `A payment of ₦${totalAmount} was deposited to your account.`,
          data: { jobRequestId: jobRequest._id, escrowId: escrow._id },
        })
      } catch (e) {
        console.warn('Failed to notify provider about payment', e)
      }
    }

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
