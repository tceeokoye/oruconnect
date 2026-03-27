import { type NextRequest, NextResponse } from "next/server"
import connectToDB from "@/lib/db"
import Post from "@/models/post"

export async function GET(request: NextRequest) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const status = searchParams.get("status") || "published"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    let query: any = { status }

    if (providerId) {
      query.provider = providerId
    }

    const posts = await Post.find(query)
      .populate("provider", "firstName lastName profilePhoto verified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Post.countDocuments(query)

    const formattedPosts = posts.map((post: any) => ({
      _id: post._id,
      id: post._id.toString(),
      providerId: post.provider?._id?.toString(),
      providerName: post.provider
        ? `${post.provider.firstName} ${post.provider.lastName}`
        : "Unknown Provider",
      businessName: post.provider?.firstName || "",
      verified: post.provider?.verified || false,
      type: post.videos?.length ? "video" : "text",
      caption: post.content,
      mediaUrl: post.videos?.[0] || post.images?.[0] || null,
      mediaThumbnail: post.images?.[0] || null,
      mediaType: post.videos?.length ? "video" : "image",
      status: post.status,
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      images: post.images || [],
      videos: post.videos || [],
    }))

    return NextResponse.json(
      {
        success: true,
        data: formattedPosts,
        posts: formattedPosts,
        total,
        hasMore: skip + limit < total,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 })
  }
}
