import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock provider list
    const providers = [
      {
        id: "1",
        name: "ElectroWorks Pro",
        category: "Electrical",
        rating: 4.9,
        reviews: 128,
        verified: true,
        location: "Lagos",
      },
      {
        id: "2",
        name: "Plumb Masters",
        category: "Plumbing",
        rating: 4.8,
        reviews: 95,
        verified: true,
        location: "Abuja",
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: providers,
        pagination: { page, limit, total: 50 },
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch providers" }, { status: 500 })
  }
}
