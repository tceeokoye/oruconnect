import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendJobAcceptanceEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobRequestId } = body;

    if (!jobRequestId) {
      return NextResponse.json(
        { message: "jobRequestId is required" },
        { status: 400 }
      );
    }

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id: jobRequestId },
      include: { client: true, provider: { include: { user: true } }, job: true }
    });

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

    const totalAmount = jobRequest.negotiatedBudget || jobRequest.budget || 0;
    const platformFee = Math.round(totalAmount * 0.06); // 6% platform fee
    const providerAdvance = Math.round(totalAmount * 0.30); // 30% advance

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update job request status
      const updatedJobRequest = await tx.jobRequest.update({
        where: { id: jobRequest.id },
        data: {
          status: "accepted",
          respondedAt: new Date(),
          acceptedAt: new Date()
        }
      });

      // 2. Create escrow
      const escrow = await tx.escrow.create({
        data: {
          jobRequestId: jobRequest.id,
          clientId: jobRequest.clientId,
          providerId: jobRequest.providerId,
          amount: totalAmount,
          platformFee,
          providerAdvance,
          status: "held",
        }
      });

      // 3. Debit client's wallet
      await tx.wallet.upsert({
        where: { userId: jobRequest.clientId },
        update: {
          availableBalance: { decrement: totalAmount },
          escrowBalance: { increment: totalAmount },
          totalSpent: { increment: totalAmount }
        },
        create: {
          userId: jobRequest.clientId,
          availableBalance: 0,
          escrowBalance: totalAmount,
          totalSpent: totalAmount
        }
      });

      // 4. Credit provider with advance (30%)
      await tx.wallet.upsert({
        where: { userId: jobRequest.providerId },
        update: {
          availableBalance: { increment: providerAdvance },
          totalEarned: { increment: providerAdvance }
        },
        create: {
          userId: jobRequest.providerId,
          availableBalance: providerAdvance,
          escrowBalance: 0,
          totalEarned: providerAdvance
        }
      });

      // 5. Create transaction records
      await tx.transaction.create({
        data: {
          transactionId: `TXN_${Date.now()}_CLIENT`,
          type: "debit",
          userId: jobRequest.clientId,
          relatedUserId: jobRequest.providerId,
          jobRequestId: jobRequest.id,
          escrowId: escrow.id,
          amount: totalAmount,
          status: "completed",
          description: `Payment for job: ${jobRequest.jobDescription}`,
          platformFee,
          providerAmount: totalAmount - platformFee,
        }
      });

      await tx.transaction.create({
        data: {
          transactionId: `TXN_${Date.now()}_PROVIDER`,
          type: "credit",
          userId: jobRequest.providerId,
          relatedUserId: jobRequest.clientId,
          jobRequestId: jobRequest.id,
          escrowId: escrow.id,
          amount: providerAdvance,
          status: "completed",
          description: `Advance payment for accepted job`,
        }
      });

      // 6. Notifications: provider and client
      await tx.notification.create({
        data: {
          userId: jobRequest.providerId,
          content: JSON.stringify({
            type: 'job_update',
            title: 'Job accepted',
            message: `Your job has been accepted: ${jobRequest.jobDescription}`,
            jobRequestId: jobRequest.id
          }),
          isRead: false
        }
      });

      await tx.notification.create({
        data: {
          userId: jobRequest.clientId,
          content: JSON.stringify({
            type: 'payment',
            title: 'Payment held in escrow',
            message: `Payment of ₦${totalAmount} has been held in escrow for your job.`,
            jobRequestId: jobRequest.id,
            escrowId: escrow.id
          }),
          isRead: false
        }
      });

      return { updatedJobRequest, escrow };
    });

    // Send email to client confirming acceptance
    if (jobRequest.client) {
      const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/client/jobs/${jobRequest.id}`;
      // Professional name is stored differently; Prisma user has 'name'
      const providerName = jobRequest.provider?.name || "Provider";
      
      await sendJobAcceptanceEmail(
        jobRequest.client.email,
        jobRequest.client.name,
        providerName,
        jobRequest.jobDescription,
        dashboardLink
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job request accepted successfully",
        data: {
          jobRequest: result.updatedJobRequest,
          escrow: result.escrow,
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
