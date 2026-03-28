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
        user: { select: { name: true, email: true, role: true, profileImage: true, createdAt: true } },
        category: true,
        services: true,
        posts: true,
      },
    });

    const data = await Promise.all(professionals.map(async (prof: any) => {
      const totalBookings = await prisma.booking.count({ where: { service: { professionalId: prof.id } } });
      const completed = await prisma.booking.count({ where: { service: { professionalId: prof.id }, status: "COMPLETED" } });
      const completionRateDec = totalBookings > 0 ? (completed / totalBookings) : 0;
      const completionRate = Math.round(completionRateDec * 100);
      const calculatedRating = totalBookings > 0 ? Number((3.5 + (completionRateDec * 1.5)).toFixed(1)) : 0;
      
      const totalLikes = prof.posts?.reduce((acc: number, post: any) => acc + (post.likes || 0), 0) || 0;
      const totalReviews = totalBookings + totalLikes;

      return {
        id: prof.id,
        name: prof.name || prof.user?.name,
        category: { name: prof.category?.name || "Services" },
        subcategory: prof.services?.[0]?.title || "General",
        state: prof.state || prof.location?.split(',')[1]?.trim() || "Nigeria",
        city: prof.city || prof.location?.split(',')[0]?.trim() || "Local",
        rating: calculatedRating,
        reviews: totalReviews,
        completionRate,
        verified: prof.isVerified,
        image: prof.faceImage || prof.user?.profileImage || prof.profileImage || "/placeholder.svg",
      };
    }));

    return NextResponse.json({ success: true, data });
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
