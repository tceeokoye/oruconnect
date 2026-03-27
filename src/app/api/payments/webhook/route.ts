import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDB from "@/lib/db";
import Transaction from "@/models/transaction";
import Wallet from "@/models/wallet";
import Escrow from "@/models/escrow";
import JobRequest from "@/models/job-request";

/**
 * Webhook endpoint for Monify payment callbacks
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const signature = request.headers.get("x-monify-signature");
    const secret = process.env.MONIFY_SECRET_KEY || "";
    
    // Hash verification (Commented out locally for testing, should be active in prod)
    if (signature) {
      const hash = crypto.createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");
      if (signature !== hash && process.env.NODE_ENV === "production") {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }
    }

    const { event, data } = body;

    if (event === "charge.success" || event === "SUCCESSFUL_TRANSACTION") {
      const reference = data.reference || data.paymentReference;
      const transaction = await Transaction.findOne({ transactionId: reference });

      if (transaction && transaction.status === "pending") {
        transaction.status = "completed";
        await transaction.save();

        // Escrow Logic
        if (transaction.description.includes("job request")) {
          // It's a job payment
          // 1. Calculate fees and advances
          const totalAmount = transaction.amount;
          const platformFee = totalAmount * 0.06;
          const providerAdvance = totalAmount * 0.30;
          const remainingEscrow = totalAmount - platformFee - providerAdvance;

          // Find the related JobRequest to know the provider
          // We stored jobRequestId in the init logic (metadata, or transaction description)
          // Actually, let's extract it safely; we assume transaction has jobRequestId
          const jobRequestId = transaction.jobRequestId;
          
          if (jobRequestId) {
            const jobReq = await JobRequest.findById(jobRequestId);
            
            if (jobReq) {
              // 2. Create Escrow Document
              const newEscrow = new Escrow({
                jobRequestId: jobReq._id,
                client: jobReq.client,
                provider: jobReq.provider,
                amount: remainingEscrow,
                platformFee,
                providerAdvance,
                status: "held",
                monifyReference: reference,
                advanceReleasedAt: new Date(),
              });
              await newEscrow.save();

              transaction.escrowId = newEscrow._id;
              await transaction.save();

              // 3. Add the 30% advance to Provider's Wallet
              const providerWallet = await Wallet.findOne({ userId: jobReq.provider });
              if (providerWallet) {
                providerWallet.availableBalance = (providerWallet.availableBalance || 0) + providerAdvance;
                providerWallet.lockedBalance = (providerWallet.lockedBalance || 0) + remainingEscrow;
                await providerWallet.save();
              } else {
                // Create wallet if it doesn't exist
                const newWallet = new Wallet({
                  userId: jobReq.provider,
                  availableBalance: providerAdvance,
                  lockedBalance: remainingEscrow,
                });
                await newWallet.save();
              }

              // Update JobRequest totalAmount
              jobReq.totalAmount = totalAmount;
              await jobReq.save();
            }
          }
        }
      }

      return NextResponse.json({ success: true, message: "Payment processed" }, { status: 200 });
    } else if (event === "charge.failed" || event === "FAILED_TRANSACTION") {
      const reference = data.reference || data.paymentReference;
      const transaction = await Transaction.findOne({ transactionId: reference });

      if (transaction && transaction.status === "pending") {
        transaction.status = "failed";
        await transaction.save();
      }
      return NextResponse.json({ success: true, message: "Failure recorded" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Event processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}
