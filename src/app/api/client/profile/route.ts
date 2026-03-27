import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";

// GET: Fetch client profile
async function getProfileHandler(request: NextRequest, auth: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        state: true,
        city: true,
        profileImage: true,
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Attempt to parse out phone and location if they exist in a related profile or just return the user object
    // Note: Since Prisma User doesn't natively have phone/location yet, we send back what we have.
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update client profile
async function updateProfileHandler(request: NextRequest, auth: any) {
  try {
    const body = await request.json();

    const updateFields: any = {};
    if (body.name) updateFields.name = body.name;
    if (body.phone) updateFields.phone = body.phone;
    if (body.state) updateFields.state = body.state;
    if (body.city) updateFields.city = body.city;
    if (body.profileImage) updateFields.profileImage = body.profileImage;

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updateFields,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        state: true,
        city: true,
        profileImage: true,
      }
    });

    return NextResponse.json({ success: true, message: "Profile updated successfully", data: user }, { status: 200 });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const GET = (req: NextRequest) => withRole(req, getProfileHandler, ["USER"]);
export const PUT = (req: NextRequest) => withRole(req, updateProfileHandler, ["USER"]);
