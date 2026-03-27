import { type NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import connectToDB from "@/lib/db";
import { withAdminPermission } from "@/lib/auth-middleware";

export async function GET(request: NextRequest, auth: any) {
  try {
    await connectToDB();

    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    
    let query: any = {};
    if (role && role !== "all") {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, auth: any) {
  try {
    await connectToDB();
    const { userId, action } = await request.json(); // action = "suspend" or "activate"

    if (!userId || !["suspend", "activate"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Toggle isApproved for suspension
    user.isApproved = action === "activate";
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: `User ${action === "activate" ? 'activated' : 'suspended'} successfully` 
    });
  } catch (error) {
    console.error("Toggle user status error:", error);
    return NextResponse.json({ message: "Failed to update user status" }, { status: 500 });
  }
}

export const GET_ROUTED = (req: NextRequest) => withAdminPermission(req, GET, ["super_admin", "manage_users"]);
export const POST_ROUTED = (req: NextRequest) => withAdminPermission(req, POST, ["super_admin", "manage_users"]);
