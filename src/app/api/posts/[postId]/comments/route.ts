import { type NextRequest, NextResponse } from "next/server"

// Mock comments storage
const COMMENTS: Record<string, Array<any>> = {}

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const comments = COMMENTS[postId] || []

    return NextResponse.json(
      {
        success: true,
        comments: comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const body = await request.json()
    const { userId, userName, userRole, text } = body

    if (!userId || !userName || !text) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (text.trim().length === 0 || text.length > 500) {
      return NextResponse.json({ message: "Comment must be 1-500 characters" }, { status: 400 })
    }

    if (!COMMENTS[postId]) {
      COMMENTS[postId] = []
    }

    const newComment = {
      id: `comment_${Date.now()}`,
      postId,
      userId,
      userName,
      userAvatar: userName.charAt(0).toUpperCase(),
      userRole,
      text,
      createdAt: new Date().toISOString(),
    }

    COMMENTS[postId].push(newComment)

    return NextResponse.json(
      {
        success: true,
        comment: newComment,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to post comment" }, { status: 500 })
  }
}
