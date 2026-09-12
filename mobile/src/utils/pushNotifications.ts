import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";

/**
 * Configure default foreground notification presentation
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Request notification permissions and fetch the Expo Push Token for this physical device.
 * @returns {Promise<string | null>} The Expo push token, or null if unsupported/denied.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Bete Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0052CC",
      sound: "default",
      enableVibrate: true,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Push Notifications] Permission not granted by user.");
      return null;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        (Constants as any)?.easConfig?.projectId ??
        "1bd10d78-53e1-44df-a8da-3b3e336866c0";

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      token = pushTokenData.data;
      console.log("[Push Notifications] Generated Expo Push Token:", token);
    } catch (err: any) {
      console.warn("[Push Notifications] Failed to get Expo push token:", err.message);
    }
  } else {
    console.log("[Push Notifications] Physical device required for remote push notifications.");
  }

  return token;
}

/**
 * Syncs the generated push token with the logged-in user's database record on the backend.
 * @param token - The Expo Push Token string
 */
export async function syncPushTokenWithBackend(token: string): Promise<void> {
  if (!token) return;

  try {
    const cachedToken = await SecureStore.getItemAsync("device_push_token");
    if (cachedToken === token) {
      // Token is already synchronized
      return;
    }

    const authToken = await SecureStore.getItemAsync("user_token");
    if (!authToken) {
      // User not logged in yet; save token to sync upon login
      await SecureStore.setItemAsync("pending_push_token", token);
      return;
    }

    await apiClient.put("/auth/push-token", { pushToken: token });
    await SecureStore.setItemAsync("device_push_token", token);
    await SecureStore.deleteItemAsync("pending_push_token");
    console.log("[Push Notifications] Successfully registered push token with backend.");
  } catch (err: any) {
    console.warn("[Push Notifications] Error syncing token with backend:", err.message);
  }
}
