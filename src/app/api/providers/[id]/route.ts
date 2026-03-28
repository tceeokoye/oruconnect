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

    // Deterministic mock generation based on name length to prevent jumping on reload
    const pseudoRandom = provider.name.length % 5;
    
    const formattedProvider = {
      id: provider.id,
      name: provider.name || provider.user.name,
      businessName: provider.user.name,
      description: provider.bio || "Professional service provider dedicated to delivering high-quality results. Contact us today to learn more about how we can help execute your projects flawlessly.",
      category: provider.category?.name || "Services",
      subcategory: provider.services[0]?.title || "General",
      state: provider.state || provider.location?.split(',')[1]?.trim() || "Nigeria",
      city: provider.city || provider.location?.split(',')[0]?.trim() || "Local",
      rating: Number((4.5 + (pseudoRandom * 0.1)).toFixed(1)),
      reviews: 12 + (pseudoRandom * 14),
      verified: provider.isVerified,
      joinedDate: provider.user.createdAt.toISOString(),
      phone: provider.phone || provider.user.phone || "N/A",
      email: provider.user.email,
      website: "Profile available exclusively on OruConnect",
      responseTime: "Usually responds under 2 hours",
      completionRate: 95 + pseudoRandom,
      image: provider.faceImage || provider.user?.profileImage || provider.profileImage || "/placeholder.svg",
      gallery: provider.portfolio.map((p: any) => p.mediaUrl).concat(provider.posts.map((p: any) => p.mediaUrl)).filter(Boolean),
      recentJobs: provider.services.map((s: any) => ({ title: s.title, status: "completed", rating: 5 })).slice(0, 3)
    }

    return NextResponse.json({ success: true, data: formattedProvider }, { status: 200 })
  } catch (error) {
    console.error("Single provider fetch error:", error)
    return NextResponse.json({ message: "Failed to fetch provider" }, { status: 500 })
  }
}
