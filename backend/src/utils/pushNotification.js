import axios from "axios";

/**
 * Checks if a string looks like a valid Expo push token
 * @param {string} token
 * @returns {boolean}
 */
export const isExpoPushToken = (token) => {
  return (
    typeof token === "string" &&
    (token.startsWith("ExponentPushToken[") ||
      token.startsWith("ExpoPushToken[") ||
      token.length > 20)
  );
};

/**
 * Send a single push notification via Expo Push API
 * @param {Object} params
 * @param {string} params.to - Expo push token
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Custom data payload
 * @param {string} [params.channelId] - Android channel ID (defaults to 'default')
 */
export const sendExpoPushNotification = async ({
  to,
  title,
  body,
  data = {},
  channelId = "default",
}) => {
  if (!isExpoPushToken(to)) {
    console.warn(`[Push Notifications] Invalid or missing push token: ${to}`);
    return null;
  }

  try {
    const payload = {
      to,
      sound: "default",
      title,
      body,
      data,
      channelId,
      priority: "high",
    };

    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      payload,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "[Push Notifications] Error sending notification:",
      error.response?.data || error.message
    );
    return null;
  }
};

/**
 * Send bulk push notifications to multiple recipients
 * @param {Array<{to: string, title: string, body: string, data?: Object}>} notifications
 */
export const sendBulkExpoPushNotifications = async (notifications) => {
  const validNotifications = notifications
    .filter((n) => isExpoPushToken(n.to))
    .map((n) => ({
      to: n.to,
      sound: "default",
      title: n.title,
      body: n.body,
      data: n.data || {},
      channelId: "default",
      priority: "high",
    }));

  if (validNotifications.length === 0) return null;

  try {
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      validNotifications,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "[Push Notifications] Error sending bulk notifications:",
      error.response?.data || error.message
    );
    return null;
  }
};
