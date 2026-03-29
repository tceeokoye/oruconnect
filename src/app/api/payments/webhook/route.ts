import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint for Monify payment callbacks
 */
export async function POST(request: NextRequest) {
  try {
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
      
      const transaction = await prisma.transaction.findUnique({
        where: { transactionId: reference }
      });

      if (transaction && transaction.status === "pending") {
        // Find the related JobRequest to know the provider
        const jobRequestId = transaction.jobRequestId;
        
        if (jobRequestId && transaction.description?.includes("job request")) {
          const jobReq = await prisma.jobRequest.findUnique({
            where: { id: jobRequestId }
          });
          
          if (jobReq) {
            const totalAmount = transaction.amount;
            const platformFee = totalAmount * 0.06;
            const providerAdvance = totalAmount * 0.30;
            const remainingEscrow = totalAmount - platformFee - providerAdvance;

            // Execute atomic transaction for webhook handling
            await prisma.$transaction(async (tx) => {
              // 1. Mark transaction as completed
              const updatedTx = await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: "completed" }
              });

              // 2. Create Escrow Document
              const newEscrow = await tx.escrow.create({
                data: {
                  jobRequestId: jobReq.id,
                  clientId: jobReq.clientId,
                  providerId: jobReq.providerId,
                  amount: remainingEscrow,
                  platformFee,
                  providerAdvance,
                  status: "held",
                  monifyReference: reference,
                  advanceReleasedAt: new Date(),
                }
              });

              // 3. Link escrow to transaction
              await tx.transaction.update({
                where: { id: transaction.id },
                data: { escrowId: newEscrow.id }
              });

              // 4. Update or create the Provider's Wallet
              await tx.wallet.upsert({
                where: { userId: jobReq.providerId },
                update: {
                  availableBalance: { increment: providerAdvance },
                  escrowBalance: { increment: remainingEscrow },
                  totalEarned: { increment: providerAdvance }
                },
                create: {
                  userId: jobReq.providerId,
                  availableBalance: providerAdvance,
                  escrowBalance: remainingEscrow,
                  totalEarned: providerAdvance,
                  totalSpent: 0
                }
              });

              // 5. Update JobRequest negotiated budget
              await tx.jobRequest.update({
                where: { id: jobReq.id },
                data: { negotiatedBudget: totalAmount }
              });
            });
          }
        } else {
          // It's a non-job payment, just mark as completed
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "completed" }
          });
        }
      }

      return NextResponse.json({ success: true, message: "Payment processed" }, { status: 200 });
    } else if (event === "charge.failed" || event === "FAILED_TRANSACTION") {
      const reference = data.reference || data.paymentReference;
      
      const transaction = await prisma.transaction.findUnique({
        where: { transactionId: reference }
      });

      if (transaction && transaction.status === "pending") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "failed" }
        });
      }
      return NextResponse.json({ success: true, message: "Failure recorded" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Event processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}
