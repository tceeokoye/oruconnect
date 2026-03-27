import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import TwoFactorAuth from "@/models/two-factor-auth";
import { extractUserId } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { isEnabled } = await request.json();

    const twoFA = await TwoFactorAuth.findOne({ userId });

    if (!twoFA) {
      return NextResponse.json(
        { message: "2FA not set up. Please setup first." },
        { status: 400 }
      );
    }

    twoFA.isEnabled = isEnabled;

    if (isEnabled) {
      twoFA.lastVerifiedAt = new Date();
    }

    await twoFA.save();

    return NextResponse.json({
      success: true,
      message: `2FA ${isEnabled ? "enabled" : "disabled"}`,
      data: {
        isEnabled: twoFA.isEnabled,
        method: twoFA.method,
      },
    });
  } catch (error) {
    console.error("Toggle 2FA error:", error);
    return NextResponse.json(
      { message: "Failed to toggle 2FA" },
      { status: 500 }
    );
  }
}
