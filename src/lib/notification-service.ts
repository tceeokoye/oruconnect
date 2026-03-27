import connectToDB from '@/lib/db';
import Notification from '@/models/notification';
import NotificationPreference from '@/models/notification-preference';
import DeviceToken from '@/models/device-token';
import User from '@/models/user';
import { sendEmail } from '@/lib/email-service';
import { sendPushNotification } from '@/lib/push-service';

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
  await connectToDB();

  // create in-app notification
  const notif = new Notification({
    userId,
    type,
    title,
    message,
    data,
    relatedId,
    deliveryMethods: { inApp: true },
  });

  await notif.save();

  // fetch preferences
  const prefs = await NotificationPreference.findOne({ userId });

  // fetch user for email
  const user = await User.findById(userId);

  // If email delivery enabled for this type
  const emailEnabled = prefs?.emailNotifications?.[type] ?? true;
  if (emailEnabled && user?.email) {
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

  // If push delivery enabled for this type
  const pushEnabled = prefs?.pushNotifications?.[type] ?? false;
  if (pushEnabled) {
    const tokens = await DeviceToken.find({ userId });
    for (const t of tokens) {
      try {
        await sendPushNotification(t.token, title, message, data || {});
      } catch (e) {
        console.warn('Push send failed', e);
      }
    }
  }

  return notif;
}

export default { createAndDeliverNotification };
