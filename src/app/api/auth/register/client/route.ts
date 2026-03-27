import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { EmailTemplates } from "@/lib/emails/templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone } = body;

    if (!firstName || !lastName || !email || !password || !phone) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create client user and wallet via Prisma
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: "USER",
        phone,
        verificationCode,
        verificationExpires,
        wallet: {
          create: {
            availableBalance: 0,
            escrowBalance: 0
          }
        }
      },
      include: {
        wallet: true
      }
    });

    // Debug Mock 
    console.log("\n=======================================================");
    console.log(`[EMAIL LOG] Client Verification CODE generated for: ${email}`);
    console.log(`Verification Code: ${verificationCode}`);
    console.log("=======================================================\n");

    // Live NodeMailer SMTP Transmission
    if (process.env.GMAIL_USER || process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // use STARTTLS
          auth: {
            user: process.env.GMAIL_USER || process.env.SMTP_USER,
            pass: process.env.GMAIL_PASS || process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: '"OruConnect" <no-reply@oruconnect.com>',
          to: email,
          subject: "Welcome to OruConnect! Please verify your Email.",
          html: EmailTemplates.VerificationCodeEmail(firstName, verificationCode, "Client"),
        });
        console.log(`[SMTP] Live verification email successfully dispatched to ${email}`);
      } catch (e) {
        console.error("[SMTP ERROR] Failed to send live verification email:", e);
      }
    } else {
      console.warn("[SMTP SYSTEM WARNING] Missing Gmail/SMTP parameters in .env file. Real emails will not be sent.");
    }

    // Create JWT Token
    const jwtSecret = process.env.JWT_SECRET || "secret";
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: process.env.JWT_EXPIRY || "7d" });

    const response = NextResponse.json({
      success: true,
      token,
      message: "Client registered successfully. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
    }, { status: 201 });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("Client Registration Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
