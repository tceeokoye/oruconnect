import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const { action } = await request.json(); // `like` or `unlike`
    
    if (!postId) {
      return NextResponse.json({ message: "Post ID requires" }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: action === "unlike" ? { decrement: 1 } : { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, likes: updatedPost.likes }, { status: 200 });
  } catch (error) {
    console.error("Like tracking error:", error);
    return NextResponse.json({ message: "Failed to update like status" }, { status: 500 });
  }
}
