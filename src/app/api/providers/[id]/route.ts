import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const provider = await prisma.professional.findUnique({
      where: { id },
      include: {
        category: true,
        user: true,
        services: true,
        portfolio: true,
        posts: true,
      }
    })

    if (!provider) {
      return NextResponse.json({ message: "Provider not found" }, { status: 404 })
    }

    const totalBookings = await prisma.booking.count({
      where: { service: { professionalId: provider.id } }
    })

    const completedBookings = await prisma.booking.count({
      where: { 
        service: { professionalId: provider.id }, 
        status: "COMPLETED" 
      }
    })

    const completionRateDec = totalBookings > 0 ? (completedBookings / totalBookings) : 0
    const completionRate = Math.round(completionRateDec * 100)
    const calculatedRating = totalBookings > 0 ? Number((3.5 + (completionRateDec * 1.5)).toFixed(1)) : 0

    const totalLikes = provider.posts.reduce((acc: number, post: any) => acc + (post.likes || 0), 0)
    const totalReviews = totalBookings + totalLikes
    
    const formattedProvider = {
      id: provider.id,
      name: provider.name || provider.user.name,
      businessName: provider.user.name,
      description: provider.bio || "Professional service provider dedicated to delivering high-quality results. Contact us today to learn more about how we can help execute your projects flawlessly.",
      category: provider.category?.name || "Services",
      subcategory: provider.services[0]?.title || "General",
      state: provider.state || provider.location?.split(',')[1]?.trim() || "Nigeria",
      city: provider.city || provider.location?.split(',')[0]?.trim() || "Local",
      rating: calculatedRating,
      reviews: totalReviews,
      verified: provider.isVerified,
      joinedDate: provider.user.createdAt.toISOString(),
      phone: provider.phone || provider.user.phone || "N/A",
      email: provider.user.email,
      website: "Profile available exclusively on OruConnect",
      responseTime: "Usually responds under 2 hours",
      completionRate: completionRate,
      image: provider.faceImage || provider.user?.profileImage || provider.profileImage || "/placeholder.svg",
      gallery: provider.portfolio.map((p: any) => ({ url: p.mediaUrl, type: "image" }))
        .concat(provider.posts.map((p: any) => ({
          url: p.mediaUrl,
          type: p.mediaUrl?.includes(".mp4") || p.mediaUrl?.includes(".webm") ? "video" : "image"
        })))
        .filter((media: any) => Boolean(media.url)),
      recentJobs: provider.services.map((s: any) => ({ title: s.title, status: "completed", rating: 5 })).slice(0, 3)
    }

    return NextResponse.json({ success: true, data: formattedProvider }, { status: 200 })
  } catch (error) {
    console.error("Single provider fetch error:", error)
    return NextResponse.json({ message: "Failed to fetch provider" }, { status: 500 })
  }
}
