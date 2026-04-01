import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user.userId;
    const role = auth.user.role;

    // Common data
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    }) || { availableBalance: 0, escrowBalance: 0, totalEarned: 0, totalSpent: 0 };

    if (role === "PROFESSIONAL") {
      const professional = await prisma.professional.findUnique({
        where: { userId },
      });

      if (!professional) {
        return NextResponse.json({ success: false, message: "Professional profile not found" }, { status: 404 });
      }

      const [pendingRequests, activeJobs, completedJobs] = await Promise.all([
        prisma.jobRequest.count({ where: { providerId: professional.id, status: "pending" } }),
        prisma.jobRequest.count({ where: { providerId: professional.id, status: "in_progress" } }),
        prisma.jobRequest.count({ where: { providerId: professional.id, status: "completed" } }),
      ]);

      // Calculate real escrow balance for provider
      const activeEscrows = await prisma.escrow.aggregate({
        where: { providerId: professional.id, status: "held" },
        _sum: { amount: true }
      });

      return NextResponse.json({
        success: true,
        summary: {
          pendingRequests,
          activeJobs,
          completedJobs,
          escrowBalance: activeEscrows._sum.amount || 0,
          withdrawableBalance: wallet.availableBalance,
          totalEarned: wallet.totalEarned
        }
      });
    } else {
      // Client Summary
      const [openJobs, jobsInProgress, totalBookings] = await Promise.all([
        prisma.job.count({ where: { clientId: userId, status: "open" } }),
        prisma.jobRequest.count({ where: { clientId: userId, status: "in_progress" } }),
        prisma.booking.count({ where: { clientId: userId } }),
      ]);

      // Calculate real escrow balance for client
      const activeEscrows = await prisma.escrow.aggregate({
        where: { clientId: userId, status: "held" },
        _sum: { amount: true }
      });

      return NextResponse.json({
        success: true,
        summary: {
          openJobs,
          jobsInProgress,
          totalBookings,
          escrowBalance: activeEscrows._sum.amount || 0,
          totalSpent: wallet.totalSpent
        }
      });
    }
  } catch (error: any) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
