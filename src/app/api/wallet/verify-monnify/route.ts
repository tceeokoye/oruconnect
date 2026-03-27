import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";

async function verifyMonnifyDeposit(request: NextRequest, auth: any) {
  try {
    const { reference, amount, status } = await request.json();
    const userId = auth.userId;

    if (!reference || !amount) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // Verify it isn't an invalid/failed status push
    if (status !== "PAID") {
      return NextResponse.json({ message: "Transaction status is not PAID" }, { status: 400 });
    }

    // Protection against replay attacks
    const existingTx = await prisma.transaction.findFirst({
      where: { transactionId: reference }
    });

    if (existingTx) {
      return NextResponse.json({ message: "Transaction reference already processed" }, { status: 400 });
    }

    // Atomically increment the wallet and log the transaction
    const [updatedWallet, newTx] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { availableBalance: { increment: Number(amount) } }
      }),
      prisma.transaction.create({
        data: {
          transactionId: reference,
          type: "deposit",
          userId,
          amount: Number(amount),
          status: "completed",
          description: "Wallet Deposit via Monnify",
          paymentMethod: "card", 
        }
      })
    ]);

    return NextResponse.json({ success: true, data: updatedWallet }, { status: 200 });

  } catch (error) {
    console.error("Monnify Verify Error:", error);
    return NextResponse.json({ message: "Failed to verify deposit" }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withRole(req, verifyMonnifyDeposit, ["USER", "PROFESSIONAL", "SUPER_ADMIN"]);
