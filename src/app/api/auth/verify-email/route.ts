import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 })
    }

    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      return NextResponse.json({ message: "Verification code has expired" }, { status: 400 })
    }

    // Clear verification fields to mark as verified
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: null,
        verificationExpires: null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
