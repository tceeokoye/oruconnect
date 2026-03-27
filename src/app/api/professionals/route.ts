import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;

    const professionals = await prisma.professional.findMany({
      where: filters,
      include: {
        user: { select: { name: true, email: true, role: true } },
        category: true,
        services: true,
      },
    });

    return NextResponse.json({ success: true, data: professionals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, categoryId, name, bio, profileImage } = body;

    if (!userId || !categoryId || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newProfessional = await prisma.professional.create({
      data: {
        userId,
        categoryId,
        name,
        bio,
        profileImage,
      },
    });

    return NextResponse.json({ success: true, data: newProfessional }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
