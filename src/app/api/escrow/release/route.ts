import { type NextRequest, NextResponse } from "next/server"

import Escrow from "@/models/escrow"
import connectToDB from "@/lib/db"
import { sendNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.escrowId || !body.initiatedBy) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectToDB()

    const escrow = await Escrow.findById(body.escrowId).populate("provider")
    if (!escrow) {
      return NextResponse.json({ message: "Escrow not found" }, { status: 404 })
    }

    // Update real DB (since this was mocked, let's just make it real or partial real)
    escrow.status = "completed"
    escrow.completedAt = new Date()
    await escrow.save()

    // Send in-app notification to provider
    await sendNotification({
      userId: escrow.provider._id.toString(),
      type: "payment",
      title: "Escrow Released",
      message: `₦${body.amount || escrow.amount} has been released to your wallet from Escrow.`,
      refModel: "Escrow",
      relatedId: escrow._id.toString(),
    });

    const released = {
      escrowId: escrow._id,
      status: "completed",
      releasedAt: escrow.completedAt,
    }

    return NextResponse.json(
      {
        success: true,
        message: "Escrow funds released successfully",
        data: released,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
