import { type NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import DeviceToken from "@/models/device-token";
import { extractUserId } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const userId = extractUserId(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { token, platform = 'web' } = await request.json();
    if (!token) return NextResponse.json({ message: 'Token required' }, { status: 400 });

    // upsert
    const existing = await DeviceToken.findOne({ token });
    if (existing) {
      existing.userId = userId;
      existing.platform = platform;
      existing.lastSeenAt = new Date();
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    const dt = new DeviceToken({ userId, token, platform });
    await dt.save();

    return NextResponse.json({ success: true, data: dt });
  } catch (error) {
    console.error('Register token error', error);
    return NextResponse.json({ message: 'Failed to register token' }, { status: 500 });
  }
}
