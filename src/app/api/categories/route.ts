import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            professionals: true,
            services: true,
          }
        }
      }
    });

    // Fetch job counts per category
    const jobsCount = await prisma.job.groupBy({
      by: ['category'],
      _count: {
        _all: true
      },
    });

    const jobMap = jobsCount.reduce((acc, current) => {
      acc[current.category] = current._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Icon/Color Mapping
    const styleMap: Record<string, any> = {
      "Electrical": { icon: "Zap", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
      "Plumbing": { icon: "Droplets", color: "text-blue-500", bgColor: "bg-blue-500/10" },
      "Carpentry": { icon: "Hammer", color: "text-amber-600", bgColor: "bg-amber-600/10" },
      "Cleaning": { icon: "Sparkles", color: "text-purple-500", bgColor: "bg-purple-500/10" },
      "IT Consulting": { icon: "Code", color: "text-green-500", bgColor: "bg-green-500/10" },
      "Design": { icon: "Palette", color: "text-pink-500", bgColor: "bg-pink-500/10" },
      "Logo": { icon: "Palette", color: "text-pink-500", bgColor: "bg-pink-500/10" },
      "Real Estate": { icon: "Home", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    };

    const data = categories.map(cat => {
      const style = styleMap[cat.name] || { icon: "Briefcase", color: "text-primary", bgColor: "bg-primary/10" };
      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: style.icon,
        color: style.color,
        bgColor: style.bgColor,
        jobs: jobMap[cat.name] || 0,
        professionals: cat._count.professionals,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: data,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Fetch categories Error:", error);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
  }
}
