import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import OTP from "@/models/otp";
import User from "@/models/user";
import { sendOTPEmail } from "@/lib/email-service";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const { email, purpose = "login" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Delete old OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose });

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otp = new OTP({
      userId: user._id,
      email,
      code,
      purpose,
      expiresAt,
    });

    await otp.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, code, user.firstName);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Continue even if email fails for now
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
      // For testing only - remove in production
      ...(process.env.NODE_ENV === "development" && {
        _testOTP: code,
      }),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
