import { prisma } from "@/lib/prisma";

export class FinanceService {
  /**
   * Approves or rejects a pending withdrawal request
   * @param transactionId The ID of the pending withdrawal transaction
   * @param action "approve" or "reject"
   */
  static async processWithdrawal(transactionId: string, action: "approve" | "reject") {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.type !== "withdrawal" || transaction.status !== "pending") {
      throw new Error("Invalid or already processed withdrawal request");
    }

    if (action === "approve") {
      return prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "completed" },
      });
    } else if (action === "reject") {
      const [_failedTx, updatedWallet] = await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "failed" },
        }),
        prisma.wallet.update({
          where: { userId: transaction.userId },
          data: { availableBalance: { increment: transaction.amount } },
        }),
      ]);
      return updatedWallet;
    }
  }
}
