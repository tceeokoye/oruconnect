import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const api_secret = process.env.CLOUDINARY_API_SECRET;
    
    if (!api_secret) {
      return NextResponse.json({ success: false, error: "Cloudinary configuration missing on server." }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "oruconnect",
      },
      api_secret
    );

    return NextResponse.json({
      success: true,
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error("Cloudinary Signature Generator Error:", error);
    return NextResponse.json({ success: false, error: "Failed to construct upload signature." }, { status: 500 });
  }
}
