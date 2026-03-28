import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const state = searchParams.get("state")
    const city = searchParams.get("city")

    // Validate inputs
    if (!query && !category && !state && !city) {
      return NextResponse.json({ message: "Please provide search criteria" }, { status: 400 })
    }

    // Perform real DB search
    const professionals = await prisma.professional.findMany({
      where: {
        isVerified: true,
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { bio: { contains: query, mode: "insensitive" } }
          ]
        }),
        ...(category && { category: { name: { contains: category, mode: "insensitive" } } }),
        ...(state && { state: { contains: state, mode: "insensitive" } }),
        ...(city && { city: { contains: city, mode: "insensitive" } }),
      },
      include: {
        category: true,
        user: true,
        services: { include: { bookings: true } },
      }
    });

    const formattedProviders = professionals.map((prof: any) => {
      let totalBookings = 0;
      let completedBookings = 0;

      prof.services?.forEach((service: any) => {
        service.bookings?.forEach((booking: any) => {
          totalBookings++;
          if (booking.status === "COMPLETED") completedBookings++;
        });
      });

      const completionRateDec = totalBookings > 0 ? (completedBookings / totalBookings) : 0;
      const calculatedRating = totalBookings > 0 ? Number((3.5 + (completionRateDec * 1.5)).toFixed(1)) : 0;

      return {
        id: prof.id,
        name: prof.name,
        category: prof.category?.name || "Service Provider",
        rating: calculatedRating,
        reviews: totalBookings,
        location: prof.city && prof.state ? `${prof.city}, ${prof.state}` : (prof.state || "Nigeria"),
        image: prof.faceImage || prof.user?.profileImage || prof.profileImage || "/placeholder.svg",
      };
    });

    const results = {
      providers: formattedProviders,
      total: formattedProviders.length,
      filters: { category, state, city },
    }

    return NextResponse.json({ success: true, data: results }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Search failed" }, { status: 500 })
  }
}
