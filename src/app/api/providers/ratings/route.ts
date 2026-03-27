import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.businessId || !body.rating || !body.comment) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Mock rating creation
    const review = {
      id: `review_${Date.now()}`,
      businessId: body.businessId,
      rating: body.rating,
      comment: body.comment,
      clientId: body.clientId,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review posted successfully",
        review,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to post review" }, { status: 500 })
  }
}
