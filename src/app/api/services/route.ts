import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const professionalId = searchParams.get("professional_id");

    const filters: any = {};
    if (categoryId) filters.categoryId = categoryId;
    if (professionalId) filters.professionalId = professionalId;

    const services = await prisma.service.findMany({
      where: filters,
      include: {
        category: true,
        professional: {
          include: {
            user: { select: { name: true, email: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { professionalId, categoryId, title, description, priceRange } = body;

    if (!professionalId || !categoryId || !title || !description || !priceRange) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newService = await prisma.service.create({
      data: {
        professionalId,
        categoryId,
        title,
        description,
        priceRange,
      },
    });

    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
