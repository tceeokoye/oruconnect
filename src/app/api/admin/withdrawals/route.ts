import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminPermission } from "@/lib/auth-middleware";
import { FinanceService } from "@/services/finance.service";

export async function getWithdrawals(request: NextRequest, auth: any) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "pending";

    const withdrawals = await prisma.transaction.findMany({
      where: { type: "withdrawal", status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            professional: { select: { profileImage: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(
      { success: true, data: withdrawals },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { message: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}

export async function processWithdrawal(request: NextRequest, auth: any) {
  try {
    const body = await request.json();
    const { transactionId, action } = body; 

    if (!transactionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    await FinanceService.processWithdrawal(transactionId, action);

    return NextResponse.json({ success: true, message: `Withdrawal ${action}d` });
  } catch (error: any) {
    console.error("Process withdrawal error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process withdrawal" },
      { status: error.message === "Invalid or already processed withdrawal request" ? 400 : 500 }
    );
  }
}

export const GET = (req: NextRequest) => withAdminPermission(req, getWithdrawals, ["SUPER_ADMIN", "OPERATIONS_ADMIN"]);
export const POST = (req: NextRequest) => withAdminPermission(req, processWithdrawal, ["SUPER_ADMIN", "OPERATIONS_ADMIN"]);
