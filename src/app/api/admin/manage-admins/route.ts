import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminPermission } from "@/lib/auth-middleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function getHandler(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const adminId = url.searchParams.get("adminId");

    if (adminId) {
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      if (!admin || admin.role === "USER" || admin.role === "PROFESSIONAL") {
        return NextResponse.json(
          { message: "Admin not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: admin }, { status: 200 });
    }

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["SUPER_ADMIN", "OPERATIONS_ADMIN", "CATEGORY_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      { message: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest, auth: any) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !name || !role) {
      return NextResponse.json(
        { message: "Missing required fields (email, name, role)" },
        { status: 400 }
      );
    }

    const validRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "CATEGORY_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: "Invalid admin role specified" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const tempPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: tempPassword,
      },
    });

    const inviteToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, type: "admin_invite" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/set-password?token=${inviteToken}`;
    
    // MOCK EMAIL LOG
    console.log("\n=======================================================");
    console.log(`[MOCK EMAIL] Sub-Admin Invitation sent to: ${email}`);
    console.log(`Role assigned: ${role}`);
    console.log(`Setup Link: ${inviteLink}`);
    console.log("=======================================================\n");

    return NextResponse.json(
      {
        success: true,
        message: "Admin invited successfully. Invitation email sent.",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { message: "Failed to invite admin" },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) => withAdminPermission(req, getHandler, ["manage_users"]);
export const POST = (req: NextRequest) => withAdminPermission(req, postHandler as any, ["manage_users"]);
