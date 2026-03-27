import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRole } from "@/lib/auth-middleware";

async function getClientJobs(request: NextRequest, auth: any) {
  try {
    // Fetch all jobs belonging to this client with their proposals
    const jobs = await prisma.job.findMany({
      where: { clientId: auth.userId },
      include: {
        requests: {
          include: {
            provider: {
              select: { name: true, user: { select: { email: true } } }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Map Prisma models to the legacy structure expected by the frontend
    const jobsWithRequests = jobs.map((job) => ({
      ...job,
      _id: job.id,
      proposals: job.requests.map((req) => ({
        ...req,
        _id: req.id,
        provider: {
          firstName: req.provider.name.split(" ")[0],
          lastName: req.provider.name.split(" ").slice(1).join(" "),
          email: req.provider.user.email,
        }
      }))
    }));

    return NextResponse.json(
      { success: true, data: jobsWithRequests },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch client jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch client jobs" },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest) => withRole(req, getClientJobs, ["USER", "SUPER_ADMIN", "OPERATIONS_ADMIN"]);
