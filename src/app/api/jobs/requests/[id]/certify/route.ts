import { type NextRequest, NextResponse } from "next/server";
import JobRequest from "@/models/job-request";
import Escrow from "@/models/escrow";
import Wallet from "@/models/wallet";
import Transaction from "@/models/transaction";
import connectToDB from "@/lib/db";
import { sendPaymentReleaseEmail } from "@/lib/email-service";
import User from "@/models/user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await request.json();
    const { clientId } = body;

    const jobRequest = await JobRequest.findById(id)
      .populate("client")
      .populate("provider");

    if (!jobRequest) {
      return NextResponse.json(
        { message: "Job request not found" },
        { status: 404 }
      );
    }

    if (jobRequest.status !== "completed") {
      return NextResponse.json(
        { message: "Job must be completed before certification" },
        { status: 400 }
      );
    }

    if (jobRequest.client._id.toString() !== clientId) {
      return NextResponse.json(
        { message: "Only the client can certify completion" },
        { status: 403 }
      );
    }

    // Get escrow
    const escrow = await Escrow.findOne({ jobRequestId: jobRequest._id });
    if (!escrow) {
      return NextResponse.json(
        { message: "Escrow not found" },
        { status: 404 }
      );
    }

    // Calculate final amounts
    const totalAmount = jobRequest.totalAmount || 0;
    const platformFee = Math.round(totalAmount * 0.06); // 6%
    const providerFinalAmount = totalAmount - platformFee;

    // Release full amount to provider
    const providerWallet = await Wallet.findOne({ userId: jobRequest.provider._id });
    if (providerWallet) {
      providerWallet.balance += providerFinalAmount - escrow.providerAdvance; // Add remaining amount
      providerWallet.totalEarned += providerFinalAmount - escrow.providerAdvance;
      await providerWallet.save();
    }

    // Release locked balance from client's wallet
    const clientWallet = await Wallet.findOne({ userId: jobRequest.client._id });
    if (clientWallet) {
      clientWallet.lockedBalance -= totalAmount;
      await clientWallet.save();
    }

    // Create transaction for final payment
    const finalPaymentTransaction = new Transaction({
      transactionId: `TXN_${Date.now()}_FINAL`,
      type: "credit",
      userId: jobRequest.provider._id,
      relatedUserId: jobRequest.client._id,
      jobRequestId: jobRequest._id,
      escrowId: escrow._id,
      amount: providerFinalAmount - escrow.providerAdvance,
      status: "completed",
      description: `Final payment for completed job: ${jobRequest.jobDescription}`,
      platformFee,
    });

    // Create platform fee transaction
    const platformFeeTransaction = new Transaction({
      transactionId: `TXN_${Date.now()}_PLATFORM`,
      type: "platform_fee",
      userId: jobRequest.provider._id,
      amount: platformFee,
      status: "completed",
      description: "Platform service fee (6%)",
    });

    await finalPaymentTransaction.save();
    await platformFeeTransaction.save();

    // Update escrow status
    escrow.status = "completed";
    escrow.completedAt = new Date();
    await escrow.save();

    // Send payment release email to provider
    await sendPaymentReleaseEmail(
      jobRequest.provider.email,
      jobRequest.provider.firstName,
      totalAmount,
      platformFee
    );

    return NextResponse.json(
      {
        success: true,
        message: "Job certified and payment released to provider",
        data: {
          jobRequest,
          escrow,
          providerEarnings: providerFinalAmount,
          platformFee,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Certify job completion error:", error);
    return NextResponse.json(
      { message: "Failed to certify job completion" },
      { status: 500 }
    );
  }
}
