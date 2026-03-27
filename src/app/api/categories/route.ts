import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock categories
    const categories = [
      {
        id: "1",
        name: "Electrical",
        description: "Installation and repair services",
        icon: "zap",
        subcategories: [
          { id: "1.1", name: "Installation" },
          { id: "1.2", name: "Repair" },
        ],
      },
      {
        id: "2",
        name: "Plumbing",
        description: "Water system services",
        icon: "droplets",
        subcategories: [
          { id: "2.1", name: "Installation" },
          { id: "2.2", name: "Repair" },
        ],
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
  }
}
