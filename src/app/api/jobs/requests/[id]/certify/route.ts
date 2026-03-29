import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReleaseEmail } from "@/lib/email-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clientId } = body;

    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id },
      include: { client: true, provider: { include: { user: true } } }
    });

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

    if (jobRequest.clientId !== clientId) {
      return NextResponse.json(
        { message: "Only the client can certify completion" },
        { status: 403 }
      );
    }

    // Get escrow
    const escrow = await prisma.escrow.findFirst({
      where: { jobRequestId: jobRequest.id }
    });

    if (!escrow) {
      return NextResponse.json(
        { message: "Escrow not found" },
        { status: 404 }
      );
    }

    // Calculate final amounts
    const totalAmount = jobRequest.negotiatedBudget || jobRequest.budget || 0;
    const platformFee = Math.round(totalAmount * 0.06); // 6%
    const providerFinalAmount = totalAmount - platformFee;
    const remainingToProvider = providerFinalAmount - escrow.providerAdvance;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Release full amount to provider
      await tx.wallet.upsert({
        where: { userId: jobRequest.providerId },
        update: {
          availableBalance: { increment: remainingToProvider },
          totalEarned: { increment: remainingToProvider }
        },
        create: {
          userId: jobRequest.providerId,
          availableBalance: remainingToProvider,
          totalEarned: remainingToProvider
        }
      });

      // 2. Release locked balance from client's wallet
      await tx.wallet.update({
        where: { userId: jobRequest.clientId },
        data: {
          escrowBalance: { decrement: totalAmount }
        }
      });

      // 3. Create transaction for final payment
      await tx.transaction.create({
        data: {
          transactionId: `TXN_${Date.now()}_FINAL`,
          type: "credit",
          userId: jobRequest.providerId,
          relatedUserId: jobRequest.clientId,
          jobRequestId: jobRequest.id,
          escrowId: escrow.id,
          amount: remainingToProvider,
          status: "completed",
          description: `Final payment for completed job: ${jobRequest.jobDescription}`,
          platformFee,
        }
      });

      // 4. Create platform fee transaction
      await tx.transaction.create({
        data: {
          transactionId: `TXN_${Date.now()}_PLATFORM`,
          type: "platform_fee",
          userId: jobRequest.providerId,
          amount: platformFee,
          status: "completed",
          description: "Platform service fee (6%)",
        }
      });

      // 5. Update escrow status
      const updatedEscrow = await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: "completed",
          completedAt: new Date()
        }
      });

      // 6. Update Job Request Status (optional but good practice to close it out here or add a specific state)
      // Usually "certified" or keep it "completed".
      // Let's just update the timestamp.

      return updatedEscrow;
    });

    // Send payment release email to provider
    if (jobRequest.provider && jobRequest.provider.user) {
      await sendPaymentReleaseEmail(
        jobRequest.provider.user.email,
        jobRequest.provider.name, // Using 'name' mapped from Prisma
        totalAmount,
        platformFee
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Job certified and payment released to provider",
        data: {
          jobRequest,
          escrow: result,
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
