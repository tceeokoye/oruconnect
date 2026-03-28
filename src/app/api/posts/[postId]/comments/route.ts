import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    
    // Search for notifications containing our JSON marker
    const rawComments = await prisma.notification.findMany({
      where: { content: { contains: `"postId":"${postId}"` } },
      orderBy: { createdAt: "asc" },
      include: { user: true }
    });

    const mappedComments = rawComments.map((c: any) => {
      let parsed = { text: "", userName: "" };
      try { parsed = JSON.parse(c.content); } catch (e) {}

      return {
        id: c.id,
        postId: postId,
        userId: c.userId,
        userName: parsed.userName || c.user?.name || "User",
        userAvatar: (parsed.userName || c.user?.name || "U").charAt(0).toUpperCase(),
        userRole: c.user?.role || "USER",
        text: parsed.text || "",
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({ success: true, comments: mappedComments }, { status: 200 });
  } catch (error) {
    console.error(error);
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

    // Embed the rich comment state inside the stringified notification content
    const richPayload = JSON.stringify({ type: "post_comment", postId, text: text.trim(), userName });

    const newDbComment = await prisma.notification.create({
      data: {
        userId,
        content: richPayload
      }
    });
    
    // Atomically increment the Post's native count
    await prisma.post.update({
      where: { id: postId },
      data: { comments: { increment: 1 } }
    });

    const newComment = {
      id: newDbComment.id,
      postId: postId,
      userId: newDbComment.userId,
      userName,
      userAvatar: userName.charAt(0).toUpperCase(),
      userRole,
      text: text.trim(),
      createdAt: newDbComment.createdAt.toISOString(),
    }

    return NextResponse.json({ success: true, comment: newComment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to post comment" }, { status: 500 })
  }
}
