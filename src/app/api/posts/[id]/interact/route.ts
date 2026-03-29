import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { action } = body;

    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "secret";
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        userId = decoded.userId;
      } catch (e) {
        // allow unauthenticated for testing if needed
      }
    }

    if (!action) {
      return NextResponse.json({ success: false, message: "Action required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    let updatedPost;

    if (action === "like") {
      updatedPost = await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });
    } else if (action === "unlike") {
      updatedPost = await prisma.post.update({
        where: { id },
        data: { likes: { decrement: 1 } }
      });
    } else if (action === "comment") {
      updatedPost = await prisma.post.update({
        where: { id },
        data: { comments: { increment: 1 } }
      });
    } else if (action === "share") {
      updatedPost = await prisma.post.update({
        where: { id },
        data: { shares: { increment: 1 } }
      });
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedPost }, { status: 200 });

  } catch (error: any) {
    console.error("Post Interaction Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
