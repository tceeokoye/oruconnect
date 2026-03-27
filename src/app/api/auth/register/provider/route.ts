import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { EmailTemplates } from "@/lib/emails/templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      businessName,
      businessPhone,
      categoryId,
      state,
      city,
      businessDescription,
      nin,
      ninImage,
      cacImage,
      faceImage
    } = body

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !businessName ||
      !categoryId ||
      !state ||
      !city ||
      !nin ||
      !ninImage ||
      !faceImage
    ) {
      return NextResponse.json({ message: "All required fields and verification images must be provided" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    if (nin.length !== 11 || !/^\d+$/.test(nin)) {
      return NextResponse.json({ message: "Invalid NIN format" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Ensure category exists or create a fallback (since we are migrating)
    let category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      category = await prisma.category.create({
        data: {
          id: categoryId,
          name: "Provisioned Category",
          slug: `cat-${categoryId}`
        }
      })
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 60 * 60 * 1000)

    // Create provider user, professional profile, and wallet in one transaction
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: "PROFESSIONAL",
        verificationCode,
        verificationExpires,
        professional: {
          create: {
            name: businessName,
            categoryId: category.id,
            bio: businessDescription,
            phone: businessPhone,
            state,
            city,
            nin,
            ninImage,
            cacImage,
            faceImage,
            isVerified: false
          }
        },
        wallet: {
          create: {
            availableBalance: 0,
            escrowBalance: 0
          }
        }
      },
      include: {
        professional: true,
        wallet: true
      }
    })

    // MOCK EMAIL LOG
    console.log("\n=======================================================");
    console.log(`[EMAIL LOG] Provider Verification CODE generated for: ${email}`);
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
        })

        await transporter.sendMail({
          from: '"OruConnect" <no-reply@oruconnect.com>',
          to: email,
          subject: "Welcome to OruConnect! Please verify your Email.",
          html: EmailTemplates.VerificationCodeEmail(firstName, verificationCode, "Service Provider"),
        })
        console.log(`[SMTP] Live verification email successfully dispatched to ${email}`);
      } catch (e) {
        console.error("[SMTP ERROR] Failed to send live verification email:", e)
      }
    } else {
      console.warn("[SMTP SYSTEM WARNING] Missing Gmail/SMTP parameters in .env file. Real emails will not be sent.")
    }

    return NextResponse.json(
      {
        success: true,
        message: "Provider account created under review. Please verify your email.",
        user: { id: user.id, email: user.email },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Provider Registration Error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

