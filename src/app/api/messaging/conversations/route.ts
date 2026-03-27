import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Mock conversations
    const conversations = [
      {
        id: "conv_1",
        otherParty: { id: "user_2", name: "John Doe", avatar: "" },
        jobId: "job_1",
        lastMessage: "Thanks for the job offer!",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 2,
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: conversations,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 })
  }
}
