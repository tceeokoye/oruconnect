import { type NextRequest, NextResponse } from "next/server";
import Admin from "@/models/admin";
import User from "@/models/user";
import connectToDB from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await request.json();
    const { status, requestedBy } = body;

    if (!status || !requestedBy) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify requestedBy is super admin
    const requester = await Admin.findOne({ userId: requestedBy });
    if (!requester || requester.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only super admin can update admin status" },
        { status: 403 }
      );
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    admin.status = status;
    await admin.save();

    return NextResponse.json(
      { success: true, message: "Admin status updated", data: admin },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { message: "Failed to update admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await request.json();
    const { requestedBy } = body;

    if (!requestedBy) {
      return NextResponse.json(
        { message: "requestedBy is required" },
        { status: 400 }
      );
    }

    // Verify requestedBy is super admin
    const requester = await Admin.findOne({ userId: requestedBy });
    if (!requester || requester.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only super admin can remove admins" },
        { status: 403 }
      );
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // Update user's role back to client
    const user = await User.findById(admin.userId);
    if (user) {
      user.role = "client";
      await user.save();
    }

    await Admin.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Admin removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { message: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
