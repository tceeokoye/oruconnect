import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";

async function getWallet(request: NextRequest, auth: any) {
  try {
    const userId = auth.userId;

    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      });
    }

    // Fetch recent transaction history
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(
      { success: true, data: { wallet, transactions } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { message: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

async function requestWithdrawal(request: NextRequest, auth: any) {
  try {
    const userId = auth.userId;
    const body = await request.json();
    const { amount, bankCode, accountNumber } = body;

    if (!amount || amount < 1000) {
      return NextResponse.json(
        { message: "Minimum withdrawal amount is ₦1000" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    
    if (!wallet || wallet.availableBalance < amount) {
      return NextResponse.json(
        { message: "Insufficient available balance" },
        { status: 400 }
      );
    }

    // Deduct and create transaction atomically using Prisma transaction
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { availableBalance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          transactionId: `WD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: "withdrawal",
          userId,
          amount,
          status: "pending",
          description: "Wallet Withdrawal",
          paymentMethod: "bank_transfer",
          metadata: { bankCode, accountNumber },
        },
      })
    ]);

    return NextResponse.json(
      { success: true, message: "Withdrawal requested successfully", data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error("Wallet withdrawal error:", error);
    return NextResponse.json(
      { message: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) => withRole(req, getWallet, ["PROFESSIONAL", "USER", "SUPER_ADMIN"]);
export const POST = (req: NextRequest) => withRole(req, requestWithdrawal, ["PROFESSIONAL"]);
