import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const body = await request.json()
    const { platform, userId } = body

    if (!postId || !platform) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Mock share tracking - in real app would increment share count in database
    const supportedPlatforms = ["copy", "whatsapp", "twitter", "facebook"]
    if (!supportedPlatforms.includes(platform)) {
      return NextResponse.json({ message: "Invalid platform" }, { status: 400 })
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Share tracked successfully",
        platform,
        postId,
        shares: updatedPost.shares,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to track share" }, { status: 500 })
  }
}
