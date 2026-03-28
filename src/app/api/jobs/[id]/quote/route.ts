import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()

    if (!body.providerId || !body.quotedPrice || !body.timeline) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Mock quotation creation
    const quote = {
      id: `quote_${Date.now()}`,
      jobId: (await params).id,
      providerId: body.providerId,
      quotedPrice: body.quotedPrice,
      timeline: body.timeline,
      description: body.description,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, quote }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
