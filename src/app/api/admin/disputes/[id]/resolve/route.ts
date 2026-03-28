import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()

    if (!body.resolution || !body.refundPercentage) {
      return NextResponse.json({ message: "Resolution details required" }, { status: 400 })
    }

    // Mock dispute resolution
    const result = {
      id: (await params).id,
      status: "resolved",
      resolution: body.resolution,
      refundPercentage: body.refundPercentage,
      resolvedAt: new Date().toISOString(),
      resolvedBy: "admin_user",
    }

    return NextResponse.json(
      {
        success: true,
        message: "Dispute resolved",
        data: result,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to resolve dispute" }, { status: 500 })
  }
}
