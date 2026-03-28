import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';
// Note: Push notifications via MongoDB DeviceToken are bypassed temporarily until migrated

export async function createAndDeliverNotification({
  userId,
  type,
  title,
  message,
  data = null,
  relatedId = null,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  relatedId?: string | null;
}) {
  // Bundle the rich UI fields into the Postgres content string
  const richPayload = JSON.stringify({
    title,
    type,
    message,
    data,
    relatedId
  });

  const notif = await prisma.notification.create({
    data: {
      userId,
      content: richPayload,
    }
  });

  // fetch user for email fallback
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Optional: Send Email (Assuming default true for now)
  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: title,
        html: `<p>${message}</p>`,
      });
    } catch (e) {
      console.warn('Failed sending notification email', e);
    }
  }

  return notif;
}

export default { createAndDeliverNotification };
