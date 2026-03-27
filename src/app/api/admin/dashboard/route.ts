import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Total Users
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // 2. Total Professionals
    const totalProfessionals = await prisma.professional.count();

    // 3. Total Services
    const totalServices = await prisma.service.count();

    // 4. Booking Statistics
    const totalBookings = await prisma.booking.count();
    
    // Revenue or Value estimation based on completed bookings
    // For now we just aggregate counts by status
    const bookingsByStatusRaw = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const bookingsByStatus = bookingsByStatusRaw.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Recent Bookings (last 5)
    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        service: {
          select: { title: true }
        },
        client: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProfessionals,
          totalServices,
          totalBookings,
        },
        bookingsByStatus,
        recentBookings,
      },
    });
  } catch (error: any) {
    console.error("Admin Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
