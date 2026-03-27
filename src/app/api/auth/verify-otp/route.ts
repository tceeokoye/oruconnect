import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import OTP from "@/models/otp";
import User from "@/models/user";
import TwoFactorAuth from "@/models/two-factor-auth";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const { email, code, purpose = "login" } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    // Find OTP
    const otpRecord = await OTP.findOne({ email, code, purpose });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { message: "OTP has expired. Request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP is already used
    if (otpRecord.isUsed) {
      return NextResponse.json(
        { message: "OTP has already been used" },
        { status: 400 }
      );
    }

    // Increment attempts
    otpRecord.attempts += 1;

    // Check max attempts
    if (otpRecord.attempts > otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "Maximum attempts exceeded. Request a new OTP." },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    otpRecord.usedAt = new Date();
    await otpRecord.save();

    // Get user
    const user = await User.findById(otpRecord.userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // If purpose is login and user is admin, check 2FA status (mandatory)
    if (purpose === "login" && (user.role === "admin" || user.role === "tech_admin")) {
      const twoFA = await TwoFactorAuth.findOne({ userId: user._id });
      
      // For admins, 2FA is mandatory
      if (!twoFA || !twoFA.isEnabled) {
        return NextResponse.json({
          success: true,
          message: "OTP verified. 2FA setup required.",
          requiresSetup2FA: true,
          userId: user._id,
          email: user.email,
          role: user.role,
        });
      }

      // Admin has 2FA enabled, send 2FA verification
      return NextResponse.json({
        success: true,
        message: "OTP verified. Proceed to 2FA verification.",
        requires2FA: true,
        userId: user._id,
        email: user.email,
        role: user.role,
      });
    }

    // For regular users, OTP verification is complete
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      userId: user._id,
      email: user.email,
      role: user.role,
      canProceedToLogin: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
