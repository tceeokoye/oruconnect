import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import NotificationPreference from "@/models/notification-preference";
import { extractUserId } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let preferences = await NotificationPreference.findOne({ userId });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = new NotificationPreference({ userId });
      await preferences.save();
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      { message: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    let preferences = await NotificationPreference.findOne({ userId });

    if (!preferences) {
      preferences = new NotificationPreference({ userId });
    }

    // Update preferences
    Object.assign(preferences, body);
    preferences.updatedAt = new Date();
    await preferences.save();

    return NextResponse.json({
      success: true,
      data: preferences,
      message: "Notification preferences updated",
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { message: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
