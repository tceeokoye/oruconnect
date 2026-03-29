import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.escrowId || !body.initiatedBy) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const escrow = await prisma.escrow.findUnique({
      where: { id: body.escrowId },
      include: { provider: true } // Assuming provider maps to User via Professional in some models, but here providerId maps to User
    })

    if (!escrow) {
      return NextResponse.json({ message: "Escrow not found" }, { status: 404 })
    }

    if (escrow.status === "completed") {
      return NextResponse.json({ message: "Escrow already released" }, { status: 400 })
    }

    const releaseAmount = body.amount || escrow.amount;

    await prisma.$transaction(async (tx) => {
      // 1. Release Escrow
      await tx.escrow.update({
        where: { id: escrow.id },
        data: {
          status: "completed",
          completedAt: new Date()
        }
      });

      // 2. Transfer from locked/escrow to available in Wallet
      await tx.wallet.update({
        where: { userId: escrow.providerId },
        data: {
          escrowBalance: { decrement: releaseAmount },
          availableBalance: { increment: releaseAmount }
        }
      });

      // 3. Send Notification
      await tx.notification.create({
        data: {
          userId: escrow.providerId,
          content: JSON.stringify({
            type: "payment",
            title: "Escrow Released",
            message: `₦${releaseAmount} has been released to your wallet from Escrow.`
          }),
          isRead: false
        }
      });
    });

    const released = {
      escrowId: escrow.id,
      status: "completed",
      releasedAt: new Date(),
    }

    return NextResponse.json(
      {
        success: true,
        message: "Escrow funds released successfully",
        data: released,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Escrow release error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
