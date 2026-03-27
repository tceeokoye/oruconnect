import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Wallet from "@/models/wallet";
import Transaction from "@/models/transaction";
import User from "@/models/user";
import MonifyService from "@/lib/monify-service";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const { userId, amount, accountNumber, bankCode } = body;

    if (!userId || !amount || !accountNumber || !bankCode) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount < 5000) {
      return NextResponse.json(
        { message: "Minimum withdrawal is ₦5,000" },
        { status: 400 }
      );
    }

    // Get user wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify account name
    const accountResolution = await MonifyService.resolveAccount(
      accountNumber,
      bankCode
    );

    if (!accountResolution.success) {
      return NextResponse.json(
        { message: "Invalid account details" },
        { status: 400 }
      );
    }

    // Initiate transfer via Monify
    const transferResponse = await MonifyService.initiateTransfer({
      source: "balance",
      reason: "Provider withdrawal",
      amount,
      recipient: accountNumber,
      reference: `WITH_${userId}_${Date.now()}`,
      currency: "NGN",
    });

    if (!transferResponse.success) {
      return NextResponse.json(
        { message: transferResponse.error },
        { status: 400 }
      );
    }

    // Update wallet
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: transferResponse.data.reference,
      type: "debit",
      userId,
      amount,
      status: "completed",
      description: `Withdrawal to ${accountResolution.accountName}`,
      paymentReference: transferResponse.data.reference,
      paymentMethod: "bank",
    });

    await transaction.save();

    return NextResponse.json(
      {
        success: true,
        message: "Withdrawal initiated successfully",
        data: {
          reference: transferResponse.data.reference,
          amount,
          accountName: accountResolution.accountName,
          status: "processing",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { message: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
