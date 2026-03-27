import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    return NextResponse.json(
      {
        success: true,
        message: "Post hidden successfully",
        postId,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to hide post" }, { status: 500 })
  }
}
