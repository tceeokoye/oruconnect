import { type NextRequest, NextResponse } from "next/server";
import JobRequest from "@/models/job-request";
import Job from "@/models/job";
import Wallet from "@/models/wallet";
import Escrow from "@/models/escrow";
import Transaction from "@/models/transaction";
import connectToDB from "@/lib/db";
import MonifyService from "@/lib/monify-service";
import { sendJobAcceptanceEmail } from "@/lib/email-service";
import User from "@/models/user";
import { createAndDeliverNotification } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { jobRequestId } = body;

    if (!jobRequestId) {
      return NextResponse.json(
        { message: "jobRequestId is required" },
        { status: 400 }
      );
    }

    const jobRequest = await JobRequest.findById(jobRequestId)
      .populate("client")
      .populate("provider");

    if (!jobRequest) {
      return NextResponse.json(
        { message: "Job request not found" },
        { status: 404 }
      );
    }

    if (jobRequest.status !== "pending") {
      return NextResponse.json(
        { message: "Job request has already been responded to" },
        { status: 400 }
      );
    }

    // Update job request status
    jobRequest.status = "accepted";
    jobRequest.respondedAt = new Date();
    jobRequest.acceptedAt = new Date();
    await jobRequest.save();

    // Create escrow for the job
    const totalAmount = jobRequest.budget || jobRequest.negotiatedBudget || 0;
    const platformFee = Math.round(totalAmount * 0.06); // 6% platform fee
    const providerAdvance = Math.round(totalAmount * 0.30); // 30% advance

    const escrow = new Escrow({
      jobRequestId: jobRequest._id,
      client: jobRequest.client._id,
      provider: jobRequest.provider._id,
      amount: totalAmount,
      platformFee,
      providerAdvance,
      status: "held",
    });

    await escrow.save();

    // Debit client's wallet
    let clientWallet = await Wallet.findOne({ userId: jobRequest.client._id });
    if (!clientWallet) {
      clientWallet = new Wallet({ userId: jobRequest.client._id });
    }

    clientWallet.balance -= totalAmount;
    clientWallet.lockedBalance += totalAmount;
    clientWallet.totalSpent += totalAmount;
    await clientWallet.save();

    // Credit provider with advance (30%)
    let providerWallet = await Wallet.findOne({ userId: jobRequest.provider._id });
    if (!providerWallet) {
      providerWallet = new Wallet({ userId: jobRequest.provider._id });
    }

    providerWallet.balance += providerAdvance;
    providerWallet.totalEarned += providerAdvance;
    await providerWallet.save();

    // Create transaction records
    const clientTransaction = new Transaction({
      transactionId: `TXN_${Date.now()}_CLIENT`,
      type: "debit",
      userId: jobRequest.client._id,
      relatedUserId: jobRequest.provider._id,
      jobRequestId: jobRequest._id,
      escrowId: escrow._id,
      amount: totalAmount,
      status: "completed",
      description: `Payment for job: ${jobRequest.jobDescription}`,
      platformFee,
      providerAmount: totalAmount - platformFee,
    });

    const providerTransaction = new Transaction({
      transactionId: `TXN_${Date.now()}_PROVIDER`,
      type: "credit",
      userId: jobRequest.provider._id,
      relatedUserId: jobRequest.client._id,
      jobRequestId: jobRequest._id,
      escrowId: escrow._id,
      amount: providerAdvance,
      status: "completed",
      description: `Advance payment for accepted job`,
    });

    await clientTransaction.save();
    await providerTransaction.save();

    // Send email to client confirming acceptance
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/jobs/${jobRequest._id}`;
    await sendJobAcceptanceEmail(
      jobRequest.client.email,
      jobRequest.client.firstName,
      jobRequest.provider.firstName,
      jobRequest.jobDescription,
      dashboardLink
    );

    // Notifications: provider and client
    try {
      await createAndDeliverNotification({
        userId: jobRequest.provider._id.toString(),
        type: 'job_update',
        title: 'Job accepted',
        message: `Your job has been accepted: ${jobRequest.jobDescription}`,
        data: { jobRequestId: jobRequest._id },
      })
    } catch (e) {
      console.warn('Failed to notify provider about job acceptance', e)
    }

    try {
      await createAndDeliverNotification({
        userId: jobRequest.client._id.toString(),
        type: 'payment',
        title: 'Payment held in escrow',
        message: `Payment of ₦${totalAmount} has been held in escrow for your job.`,
        data: { jobRequestId: jobRequest._id, escrowId: escrow._id },
      })
    } catch (e) {
      console.warn('Failed to notify client about escrow', e)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job request accepted successfully",
        data: {
          jobRequest,
          escrow,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Accept job request error:", error);
    return NextResponse.json(
      { message: "Failed to accept job request" },
      { status: 500 }
    );
  }
}
