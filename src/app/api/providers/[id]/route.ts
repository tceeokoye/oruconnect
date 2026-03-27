import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Mock provider details
    const provider = {
      id: params.id,
      name: "ElectroWorks Pro",
      description: "Professional electrical services",
      rating: 4.9,
      reviews: 128,
      verified: true,
      location: "Lagos, Nigeria",
      responseTime: "2 hours",
      completionRate: 98,
      joinedDate: "2023-06-15",
      gallery: [],
      recentJobs: [],
    }

    return NextResponse.json({ success: true, data: provider }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch provider" }, { status: 500 })
  }
}
