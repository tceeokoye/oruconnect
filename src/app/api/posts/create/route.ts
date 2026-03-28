import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, providerName, businessName, verified, type, caption, mediaUrl, mediaThumbnail } = body

    if (!providerId || !type || (!caption && !mediaUrl)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (type === "video" || type === "video_with_text") {
      if (!mediaUrl) {
        return NextResponse.json({ message: "Video URL is required for video posts" }, { status: 400 })
      }
    }

    const newPost = await prisma.post.create({
      data: {
        providerId,
        providerName,
        businessName: businessName || null,
        type,
        caption: caption || "",
        mediaUrl: mediaUrl || null,
        mediaThumbnail: mediaThumbnail || null,
        status: verified ? "approved" : "pending",
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: verified ? "Post published successfully!" : "Post submitted for review",
        post: newPost,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ message: "Failed to create post" }, { status: 500 })
  }
}
