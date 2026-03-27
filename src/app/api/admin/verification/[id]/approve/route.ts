import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    const professional = await prisma.professional.findUnique({
      where: { id }
    });

    if (!professional) {
      return NextResponse.json({ message: "Professional not found" }, { status: 404 });
    }

    // Approve the professional
    const updatedProf = await prisma.professional.update({
      where: { id },
      data: { isVerified: true }
    });

    // Ensure user role is PROFESSIONAL
    await prisma.user.update({
      where: { id: professional.userId },
      data: { role: "PROFESSIONAL" }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business approved successfully",
        data: updatedProf,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ message: "Failed to approve" }, { status: 500 })
  }
}
