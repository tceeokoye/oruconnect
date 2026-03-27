import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const state = searchParams.get("state")
    const city = searchParams.get("city")

    // Validate inputs
    if (!query && !category && !state && !city) {
      return NextResponse.json({ message: "Please provide search criteria" }, { status: 400 })
    }

    // Mock search results
    const results = {
      providers: [
        {
          id: "1",
          name: "ElectroWorks Pro",
          category: "Electrical",
          rating: 4.9,
          reviews: 128,
          location: `${city || "Lagos"}, ${state || "Lagos"}`,
        },
      ],
      total: 1,
      filters: {
        category,
        state,
        city,
      },
    }

    return NextResponse.json({ success: true, data: results }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Search failed" }, { status: 500 })
  }
}
