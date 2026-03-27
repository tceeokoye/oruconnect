import axios from "axios";

const FCM_ENDPOINT = "https://fcm.googleapis.com/fcm/send";
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || "";

export async function sendPushNotification(token: string, title: string, body: string, data: Record<string, any> = {}) {
  if (!FCM_SERVER_KEY) {
    console.warn("FCM server key not configured. Skipping push send.");
    return { success: false, reason: "no_fcm_key" };
  }

  try {
    const payload: any = {
      to: token,
      notification: {
        title,
        body,
        sound: "default",
      },
      data,
    };

    const res = await axios.post(FCM_ENDPOINT, payload, {
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error("FCM send error:", error?.response?.data || error.message || error);
    return { success: false, error: error?.response?.data || error.message };
  }
}

export default { sendPushNotification };
