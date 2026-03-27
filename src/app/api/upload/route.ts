import { type NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Safely convert buffer to a Base64 data URI format for Cloudinary
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileUri,
        { folder: 'oruconnect', resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            resolve(NextResponse.json({ success: false, message: "Upload failed: " + (error.message || "Unknown error") }, { status: 500 }));
          } else {
            resolve(NextResponse.json({
              success: true,
              message: "File uploaded successfully",
              data: { url: result?.secure_url, filename: result?.public_id },
            }, { status: 201 }));
          }
        }
      );
    });

  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
