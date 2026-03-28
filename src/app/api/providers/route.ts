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
        services: {
          include: {
            bookings: true
          }
        }
      }
    });

    const formattedProviders = professionals.map((prof: any) => {
      let totalBookings = 0;
      let completedBookings = 0;

      prof.services?.forEach((service: any) => {
        service.bookings?.forEach((booking: any) => {
          totalBookings++;
          if (booking.status === "COMPLETED") {
            completedBookings++;
          }
        });
      });

      // Calculate pseudo-rating based on authentic completion rate (same platform standard)
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) : 0;
      const calculatedRating = totalBookings > 0 ? Number((3.5 + (completionRate * 1.5)).toFixed(1)) : 0;

      return {
        id: prof.id,
        name: prof.name,
        category: prof.category?.name || "Service Provider",
        rating: calculatedRating,
        reviews: totalBookings,
        verified: true,
        location: prof.city && prof.state ? `${prof.city}, ${prof.state}` : (prof.state || "Nigeria"),
        image: prof.faceImage || prof.user?.profileImage || prof.profileImage || "/placeholder.svg",
      };
    });

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
