import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminPermission } from "@/lib/auth-middleware";

async function getHandler(request: NextRequest, auth: any, context: { params: { id: string } }) {
  try {
    const professional = await prisma.professional.findUnique({
      where: { id: context.params.id },
      include: {
        user: true,
        category: true,
      },
    });

    if (!professional) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const verification = {
      id: professional.id,
      businessName: professional.name,
      ownerName: professional.user.name,
      email: professional.user.email,
      phone: professional.phone || "N/A",
      category: professional.category?.name || "Uncategorized",
      subcategory: "N/A",
      state: professional.state || "N/A",
      city: professional.city || "N/A",
      nin: professional.nin || "N/A",
      cacNo: professional.cacImage ? "Provided" : "N/A",
      businessAddress: professional.city ? `${professional.city}, ${professional.state}` : "N/A",
      submittedDate: professional.user.createdAt,
      documents: [
        professional.ninImage ? { name: "NIN Document", url: professional.ninImage, verified: false } : null,
        professional.cacImage ? { name: "CAC Certificate", url: professional.cacImage, verified: false } : null,
        professional.faceImage ? { name: "Face Image", url: professional.faceImage, verified: false } : null,
      ].filter(Boolean),
    };

    return NextResponse.json({ success: true, data: verification }, { status: 200 });
  } catch (error) {
    console.error("Error fetching detailed verification:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export const GET = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  return withAdminPermission(req, async (request, auth) => {
    const resolvedParams = await context.params;
    return getHandler(request, auth, { params: resolvedParams });
  }, ["manage_users"]);
}
