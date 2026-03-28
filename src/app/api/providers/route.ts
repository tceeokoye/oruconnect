import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const professionals = await prisma.professional.findMany({
      where: { isVerified: true },
      take: limit,
      orderBy: { user: { createdAt: "desc" } },
      include: {
        category: true,
        user: true,
      }
    });

    const formattedProviders = professionals.map((prof: any) => ({
      id: prof.id,
      name: prof.name,
      category: prof.category?.name || "Service Provider",
      rating: 4.8 + (Math.random() * 0.2), // Base solid rating for placeholders
      reviews: Math.floor(Math.random() * 100) + 15, // Placeholder review count
      verified: true,
      location: prof.city && prof.state ? `${prof.city}, ${prof.state}` : (prof.state || "Nigeria"),
      image: prof.faceImage || prof.user?.profileImage || prof.profileImage || "/placeholder.svg",
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedProviders,
        pagination: { limit, total: formattedProviders.length },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching providers API:", error);
    return NextResponse.json({ message: "Failed to fetch providers" }, { status: 500 })
  }
}
