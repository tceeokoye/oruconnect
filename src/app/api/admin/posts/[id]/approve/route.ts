import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    return NextResponse.json(
      {
        success: true,
        message: "Post approved successfully",
        postId,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to approve post" }, { status: 500 })
  }
}
