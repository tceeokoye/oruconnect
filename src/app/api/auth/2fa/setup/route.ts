import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import TwoFactorAuth from "@/models/two-factor-auth";
import User from "@/models/user";
import { extractUserId } from "@/lib/validation";
import { sendTwoFactorSetupEmail } from "@/lib/email-service";

// Generate backup codes
function generateBackupCodes(count: number = 10): string[] {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let twoFA = await TwoFactorAuth.findOne({ userId });

    if (!twoFA) {
      twoFA = new TwoFactorAuth({ userId });
      await twoFA.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: twoFA.isEnabled,
        method: twoFA.method,
        isMandatory: twoFA.isMandatory,
        trustedDevices: twoFA.trustedDevices,
      },
    });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    return NextResponse.json(
      { message: "Failed to fetch 2FA status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { method = "email" } = await request.json();

    if (!["email", "authenticator"].includes(method)) {
      return NextResponse.json(
        { message: "Invalid 2FA method" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let twoFA = await TwoFactorAuth.findOne({ userId });

    if (!twoFA) {
      twoFA = new TwoFactorAuth({ userId });
    }

    twoFA.method = method;

    if (method === "email") {
      // Generate backup codes for email method
      const backupCodes = generateBackupCodes();
      twoFA.backupCodes = backupCodes;
    } else if (method === "authenticator") {
      // For authenticator, secret will be generated when user completes setup
      // This is just setup initiation
    }

    await twoFA.save();

    // Send setup email
    try {
      await sendTwoFactorSetupEmail(user.email, user.firstName, method);
    } catch (emailError) {
      console.error("Setup email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "2FA setup initiated",
      data: {
        method,
        ...(method === "email" && { backupCodes: twoFA.backupCodes }),
      },
    });
  } catch (error) {
    console.error("Setup 2FA error:", error);
    return NextResponse.json(
      { message: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}
