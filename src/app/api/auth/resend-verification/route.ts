import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { EmailTemplates } from "@/lib/emails/templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: code,
        verificationExpires: expiresAt,
      }
    })

    console.log(`[EMAIL LOG] Resending Verification Code for ${email}: ${code}`)

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
          subject: "Your new Verification Code - OruConnect",
          html: EmailTemplates.VerificationCodeEmail(user.name.split(" ")[0], code, user.role),
        });
        console.log(`[SMTP] Live verification email resent to ${email}`);
      } catch (e) {
        console.error("[SMTP ERROR] Failed to resend live verification email:", e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Resend error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
