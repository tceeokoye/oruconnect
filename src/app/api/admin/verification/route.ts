import { type NextRequest, NextResponse } from "next/server";
import { withAdminPermission } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

async function getHandler(request: NextRequest) {
  try {
    const professionals = await prisma.professional.findMany({
      where: { isVerified: false },
      include: {
        user: true,
        category: true,
      },
      orderBy: { user: { createdAt: "desc" } }
    });

    const verifications = professionals.map((prof) => {
      let documentCount = 0;
      if (prof.ninImage) documentCount++;
      if (prof.cacImage) documentCount++;
      if (prof.faceImage) documentCount++;

      return {
        id: prof.id,
        businessName: prof.name,
        ownerName: prof.user.name,
        category: prof.category.name,
        state: prof.state || "N/A",
        nin: prof.nin || "N/A",
        cacNo: prof.cacImage ? "Provided" : "N/A",
        submittedDate: prof.user.createdAt,
        status: "pending",
        documents: documentCount,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: verifications,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return NextResponse.json({ message: "Failed to fetch verifications" }, { status: 500 })
  }
}

export const GET = (req: NextRequest) => withAdminPermission(req, getHandler, ["manage_users"]);
