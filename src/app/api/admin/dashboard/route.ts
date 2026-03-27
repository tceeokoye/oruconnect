import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const pendingVerifications = await prisma.professional.count({
      where: { isVerified: false },
    });

    const totalBusinesses = await prisma.professional.count();

    const activeJobs = await prisma.jobRequest.count({
      where: { status: "in_progress" },
    });

    const totalDisputes = await prisma.dispute.count();

    const recentVerifications = await prisma.professional.findMany({
      orderBy: { user: { createdAt: "desc" } },
      take: 5,
      include: {
        user: { select: { name: true, createdAt: true } },
      },
    });

    const formattedVerifications = recentVerifications.map((prof) => ({
      id: prof.id,
      business: prof.name,
      owner: prof.user.name,
      nin: prof.nin || "N/A",
      submittedDate: prof.user.createdAt,
      status: prof.isVerified ? "approved" : "pending",
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          pendingVerifications,
          totalBusinesses,
          activeJobs,
          totalDisputes,
        },
        recentVerifications: formattedVerifications,
      },
    });
  } catch (error: any) {
    console.error("Admin Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
