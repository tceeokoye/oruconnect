import { type NextRequest, NextResponse } from "next/server";
import Dispute from "@/models/dispute";
import Escrow from "@/models/escrow";
import Wallet from "@/models/wallet";
import Transaction from "@/models/transaction";
import connectToDB from "@/lib/db";
import { sendDisputeResolutionEmail } from "@/lib/email-service";
import User from "@/models/user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await request.json();
    const {
      resolution,
      resolutionType,
      resolvedBy,
      clientRefundPercentage,
    } = body;

    if (!resolution || !resolutionType || !resolvedBy) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const dispute = await Dispute.findById(id)
      .populate("complainant")
      .populate("defendant")
      .populate("escrowId");

    if (!dispute) {
      return NextResponse.json(
        { message: "Dispute not found" },
        { status: 404 }
      );
    }

    // Get escrow details
    const escrow = await Escrow.findById(dispute.escrowId);
    if (!escrow) {
      return NextResponse.json(
        { message: "Escrow not found" },
        { status: 404 }
      );
    }

    // Resolve dispute based on resolution type
    if (resolutionType === "full_refund") {
      // Refund full amount to client
      const clientWallet = await Wallet.findOne({ userId: dispute.complainant._id });
      if (clientWallet) {
        clientWallet.balance += escrow.amount;
        clientWallet.lockedBalance -= escrow.amount;
        await clientWallet.save();
      }

      // Remove from provider
      const providerWallet = await Wallet.findOne({
        userId: dispute.defendant._id,
      });
      if (providerWallet) {
        providerWallet.balance -= escrow.providerAdvance;
        providerWallet.totalEarned -= escrow.providerAdvance;
        await providerWallet.save();
      }

      escrow.status = "refunded";
    } else if (resolutionType === "complete_release") {
      // Release full amount to provider (minus platform fee)
      const platformFee = Math.round(escrow.amount * 0.06);
      const providerFinal = escrow.amount - platformFee;

      const providerWallet = await Wallet.findOne({
        userId: dispute.defendant._id,
      });
      if (providerWallet) {
        providerWallet.balance += providerFinal - escrow.providerAdvance;
        providerWallet.totalEarned += providerFinal - escrow.providerAdvance;
        await providerWallet.save();
      }

      const clientWallet = await Wallet.findOne({ userId: dispute.complainant._id });
      if (clientWallet) {
        clientWallet.lockedBalance -= escrow.amount;
        await clientWallet.save();
      }

      escrow.status = "completed";
    } else if (resolutionType === "split") {
      // Split based on percentage
      const clientRefund = Math.round(
        escrow.amount * ((clientRefundPercentage || 50) / 100)
      );
      const providerAmount = escrow.amount - clientRefund;
      const platformFee = Math.round(providerAmount * 0.06);
      const providerFinal = providerAmount - platformFee;

      const clientWallet = await Wallet.findOne({ userId: dispute.complainant._id });
      if (clientWallet) {
        clientWallet.balance += clientRefund;
        clientWallet.lockedBalance -= escrow.amount;
        await clientWallet.save();
      }

      const providerWallet = await Wallet.findOne({
        userId: dispute.defendant._id,
      });
      if (providerWallet) {
        providerWallet.balance += providerFinal;
        providerWallet.totalEarned += providerFinal;
        await providerWallet.save();
      }

      escrow.status = "partial_released";
    }

    // Update dispute
    dispute.status = "resolved";
    dispute.resolutionType = resolutionType;
    dispute.resolution = resolution;
    dispute.resolvedBy = resolvedBy;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await escrow.save();

    // Send resolution emails
    const disputeLink = `${process.env.NEXT_PUBLIC_APP_URL}/disputes/${dispute._id}`;
    await sendDisputeResolutionEmail(
      dispute.complainant.email,
      dispute.complainant.firstName,
      resolutionType.replace(/_/g, " "),
      resolution
    );
    await sendDisputeResolutionEmail(
      dispute.defendant.email,
      dispute.defendant.firstName,
      resolutionType.replace(/_/g, " "),
      resolution
    );

    return NextResponse.json(
      {
        success: true,
        message: "Dispute resolved successfully",
        data: dispute,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return NextResponse.json(
      { message: "Failed to resolve dispute" },
      { status: 500 }
    );
  }
}
