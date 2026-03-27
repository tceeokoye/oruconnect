import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));

    const professional = await prisma.professional.findUnique({
      where: { id }
    });

    if (!professional) {
      return NextResponse.json({ message: "Professional not found" }, { status: 404 });
    }

    // Revert user role if it was provisionally set to professional
    await prisma.user.update({
      where: { id: professional.userId },
      data: { role: "USER" }
    });

    // Delete the unverified professional record so they can apply again
    await prisma.professional.delete({
      where: { id }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Business request rejected and removed",
        data: { id, status: "rejected" },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Rejection error:", error);
    return NextResponse.json({ message: "Failed to reject" }, { status: 500 })
  }
}
