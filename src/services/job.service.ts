import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

export class JobService {
  /**
   * Accepts a provider's proposal and sets the job to in_progress
   */
  static async acceptProposal(proposalId: string, clientId: string) {
    const proposal = await prisma.jobRequest.findFirst({
      where: { id: proposalId, clientId },
    });

    if (!proposal) {
      throw new Error("Proposal not found or unauthorized");
    }

    if (proposal.status !== "pending") {
      throw new Error("This proposal cannot be accepted.");
    }

    // Accept proposal and update related entities atomically
    await prisma.$transaction([
      prisma.jobRequest.update({
        where: { id: proposal.id },
        data: { status: "accepted" },
      }),
      prisma.jobRequest.updateMany({
        where: { jobId: proposal.jobId, id: { not: proposal.id }, status: "pending" },
        data: { status: "rejected" },
      }),
      prisma.job.update({
        where: { id: proposal.jobId },
        data: {
          status: "in_progress",
          targetProviderId: proposal.providerId,
        },
      }),
    ]);

    // Notify the provider safely
    const job = await prisma.job.findUnique({ where: { id: proposal.jobId } });
    await sendNotification({
      userId: proposal.providerId,
      type: "job_update",
      title: "Proposal Accepted!",
      message: `Your proposal for "${job?.title || "a job"}" was accepted.`,
      refModel: "JobRequest",
      relatedId: proposal.id,
    });

    return proposal;
  }

  /**
   * Completes an active job and releases the pseudo-escrow balance to the provider
   */
  static async completeJob(jobId: string, clientId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, clientId },
    });

    if (!job || job.status !== "in_progress") {
      throw new Error("Active job not found or unauthorized");
    }

    const jobReq = await prisma.jobRequest.findFirst({
      where: { jobId: job.id, status: "accepted" },
    });

    if (!jobReq) {
      throw new Error("Accepted proposal not found for this job");
    }

    const paymentAmount = jobReq.budget;

    // Update Wallet, Job, and JobRequest atomically
    await prisma.$transaction([
      prisma.job.update({ where: { id: job.id }, data: { status: "completed" } }),
      prisma.jobRequest.update({ where: { id: jobReq.id }, data: { status: "completed" } }),
      prisma.wallet.upsert({
        where: { userId: jobReq.providerId },
        update: {
          availableBalance: { increment: paymentAmount },
          escrowBalance: { decrement: paymentAmount > 0 ? paymentAmount : 0 },
        },
        create: {
          userId: jobReq.providerId,
          availableBalance: paymentAmount,
        },
      }),
    ]);

    return jobReq;
  }
}
