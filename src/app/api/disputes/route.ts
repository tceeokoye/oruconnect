import { type NextRequest, NextResponse } from "next/server";
import Dispute from "@/models/dispute";
import Admin from "@/models/admin";
import Escrow from "@/models/escrow";
import Wallet from "@/models/wallet";
import Transaction from "@/models/transaction";
import connectToDB from "@/lib/db";
import {
  sendDisputeNotificationEmail,
  sendDisputeResolutionEmail,
} from "@/lib/email-service";
import User from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const status = url.searchParams.get("status");

    let query: any = {};
    if (id) query._id = id;
    if (status) query.status = status;

    const disputes = await Dispute.find(query)
      .populate("complainant", "firstName lastName email")
      .populate("defendant", "firstName lastName email")
      .populate("resolvedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: disputes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get disputes error:", error);
    return NextResponse.json(
      { message: "Failed to fetch disputes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    const body = await request.json();
    const {
      jobRequestId,
      escrowId,
      complainant,
      defendant,
      title,
      description,
      evidence,
    } = body;

    if (!jobRequestId || !escrowId || !complainant || !defendant || !title) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const dispute = new Dispute({
      jobRequestId,
      escrowId,
      complainant,
      defendant,
      title,
      description,
      evidence,
      status: "open",
    });

    await dispute.save();

    // Get defendant info and send notification
    const defendantUser = await User.findById(defendant);
    if (defendantUser) {
      const disputeLink = `${process.env.NEXT_PUBLIC_APP_URL}/disputes/${dispute._id}`;
      await sendDisputeNotificationEmail(
        defendantUser.email,
        defendantUser.firstName,
        title,
        disputeLink
      );
    }

    // Notify admins (disputes_admin)
    const disputeAdmins = await Admin.find({ role: "disputes_admin" });

    return NextResponse.json(
      {
        success: true,
        message: "Dispute created successfully",
        data: dispute,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create dispute error:", error);
    return NextResponse.json(
      { message: "Failed to create dispute" },
      { status: 500 }
    );
  }
}
