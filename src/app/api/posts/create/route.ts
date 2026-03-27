import { type NextRequest, NextResponse } from "next/server"

// Mock posts storage
const POSTS: Array<any> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, providerName, businessName, verified, type, caption, mediaUrl, mediaThumbnail } = body

    if (!providerId || !type || !caption) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (type === "video" || type === "video_with_text") {
      if (!mediaUrl) {
        return NextResponse.json({ message: "Video URL is required for video posts" }, { status: 400 })
      }
    }

    if (caption.length > 500) {
      return NextResponse.json({ message: "Caption must be less than 500 characters" }, { status: 400 })
    }

    const newPost = {
      id: `post_${Date.now()}`,
      providerId,
      providerName,
      businessName,
      verified,
      type,
      caption,
      mediaUrl: mediaUrl || null,
      mediaThumbnail: mediaThumbnail || null,
      mediaType: type.includes("video") ? "video" : null,
      status: verified ? "approved" : "pending",
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    POSTS.push(newPost)

    return NextResponse.json(
      {
        success: true,
        message: verified ? "Post published successfully!" : "Post submitted for review",
        post: newPost,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to create post" }, { status: 500 })
  }
}
