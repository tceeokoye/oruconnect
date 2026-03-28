import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const status = searchParams.get("status")

    let where: any = {}
    if (providerId) {
      where.providerId = providerId
    }
    if (status) {
      where.status = status
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          select: {
            name: true,
            isVerified: true,
            profileImage: true,
            user: { select: { name: true } }
          }
        }
      }
    })

    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      providerId: post.providerId,
      providerName: post.providerName,
      businessName: post.businessName || "",
      verified: post.provider.isVerified,
      type: post.type,
      caption: post.caption,
      mediaUrl: post.mediaUrl,
      mediaThumbnail: post.mediaThumbnail,
      mediaType: post.type.includes("video") ? "video" : "image",
      status: post.status,
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }))

    return NextResponse.json(
      {
        success: true,
        data: formattedPosts,
        posts: formattedPosts, 
        total: formattedPosts.length,
        hasMore: false,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching native posts from Supabase:", error)
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 })
  }
}
