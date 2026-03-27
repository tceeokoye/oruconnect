import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import TwoFactorAuth from "@/models/two-factor-auth";
import OTP from "@/models/otp";
import { extractUserId } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { code, method = "email", deviceId, deviceName, userAgent, ipAddress } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "Verification code is required" },
        { status: 400 }
      );
    }

    const twoFA = await TwoFactorAuth.findOne({ userId });

    if (!twoFA || !twoFA.isEnabled) {
      return NextResponse.json(
        { message: "2FA is not enabled" },
        { status: 400 }
      );
    }

    if (method === "email") {
      // Verify against OTP
      const otpRecord = await OTP.findOne({
        userId,
        code,
        purpose: "2fa_verification",
        isUsed: false,
      });

      if (!otpRecord) {
        return NextResponse.json(
          { message: "Invalid verification code" },
          { status: 400 }
        );
      }

      // Check expiry
      if (new Date() > otpRecord.expiresAt) {
        return NextResponse.json(
          { message: "Verification code has expired" },
          { status: 400 }
        );
      }

      // Mark OTP as used
      otpRecord.isUsed = true;
      otpRecord.usedAt = new Date();
      await otpRecord.save();
    }

    // Update last verified time
    twoFA.lastVerifiedAt = new Date();

    // Add to trusted devices if deviceId provided
    if (deviceId) {
      const deviceExists = twoFA.trustedDevices.some((d) => d.deviceId === deviceId);
      if (!deviceExists && twoFA.trustedDevices.length < 5) {
        // Limit to 5 trusted devices
        twoFA.trustedDevices.push({
          deviceId,
          name: deviceName || "Unknown Device",
          userAgent,
          ipAddress,
        });
      }
    }

    await twoFA.save();

    return NextResponse.json({
      success: true,
      message: "2FA verification successful",
      canProceedToLogin: true,
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    return NextResponse.json(
      { message: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}
