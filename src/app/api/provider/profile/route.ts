import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "secret";
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        userId = decoded.userId;
      } catch (e) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profileImage, firstName, lastName, phone, bio, city, state } = body;

    // Update the User table
    const updateData: any = {};
    if (firstName || lastName) {
      updateData.name = `${firstName || ""} ${lastName || ""}`.trim();
    }
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update the Professional table if it exists
    const professional = await prisma.professional.findUnique({
      where: { userId },
    });

    if (professional) {
      const profUpdate: any = {};
      if (profileImage !== undefined) {
        profUpdate.faceImage = profileImage;
        profUpdate.profileImage = profileImage;
      }
      if (phone !== undefined) profUpdate.phone = phone;
      if (bio !== undefined) profUpdate.bio = bio;
      if (city !== undefined) profUpdate.city = city;
      if (state !== undefined) profUpdate.state = state;
      
      await prisma.professional.update({
        where: { id: professional.id },
        data: profUpdate,
      });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully", profileImage });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    let userId = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "secret";
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        userId = decoded.userId;
      } catch (e) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professional: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
        email: user.email,
        phone: user.professional?.phone || user.phone || "",
        businessName: user.professional?.name || "",
        description: user.professional?.bio || "",
        city: user.professional?.city || user.city || "",
        state: user.professional?.state || user.state || "",
        profileImage: user.profileImage || user.professional?.faceImage || user.professional?.profileImage || "",
      }
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
