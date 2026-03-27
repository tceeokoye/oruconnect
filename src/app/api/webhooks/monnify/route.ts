import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("monnify-signature");
    const secretKey = process.env.MONIFY_SECRET_KEY;

    // Reject if server is missing the secret key
    if (!secretKey) {
      console.error("[Monnify Webhook] Server is missing MONIFY_SECRET_KEY");
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    // Reject if Monnify didn't sign the request
    if (!signature) {
      return NextResponse.json({ message: "Missing signature" }, { status: 401 });
    }

    // Compute expected signature to securely verify Monnify is the true sender
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("[Monnify Webhook] Invalid signature detected.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Only process successful transaction events
    if (payload.eventType === "SUCCESSFUL_TRANSACTION") {
      const eventData = payload.eventData;
      const reference = eventData.transactionReference || eventData.paymentReference;
      const paymentStatus = eventData.paymentStatus;
      const amount = eventData.amountPaid;
      
      // Safety Check
      if (paymentStatus !== "PAID") {
        return NextResponse.json({ message: "Transaction not paid" }, { status: 200 });
      }

      // Ensure the frontend SDK didn't already process this deposit
      const existingTx = await prisma.transaction.findFirst({
        where: { transactionId: reference }
      });

      if (existingTx) {
        return NextResponse.json({ message: "Transaction already processed by frontend" }, { status: 200 });
      }

      // Extract the userId from the metadata we injected on the frontend
      const userId = eventData.metaData?.userId;

      if (!userId) {
        console.error(`[Monnify Webhook] No userId found in metadata for reference ${reference}. Cannot credit wallet.`);
        return NextResponse.json({ message: "Missing userId in metadata" }, { status: 400 });
      }

      // Atomically process the delayed Webhook deposit
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId },
          data: { availableBalance: { increment: Number(amount) } }
        }),
        prisma.transaction.create({
          data: {
            transactionId: reference,
            type: "deposit",
            userId,
            amount: Number(amount),
            status: "completed",
            description: "Wallet Deposit via Monnify Webhook",
            paymentMethod: "card", // Default fallback
          }
        })
      ]);

      console.log(`[Monnify Webhook] Successfully credited Wallet for User ${userId}`);
      return NextResponse.json({ success: true, message: "Wallet credited successfully via webhook." }, { status: 200 });
    }

    // Acknowledge other event types silently
    return NextResponse.json({ success: true, message: "Event ignored" }, { status: 200 });

  } catch (error) {
    console.error("[Monnify Webhook] Error:", error);
    return NextResponse.json({ message: "Failed to process webhook" }, { status: 500 });
  }
}
