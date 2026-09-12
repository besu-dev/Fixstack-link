import React, { useEffect, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { AlertProvider } from "../src/context/AlertContext";
import { UnreadMessagesProvider } from "../src/context/UnreadMessagesContext";
import {
  registerForPushNotificationsAsync,
  syncPushTokenWithBackend,
} from "../src/utils/pushNotifications";

function RootLayoutContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // 1. Register device for push notifications and sync with backend
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        syncPushTokenWithBackend(token);
      }
    });

    // 2. Handle notifications received while app is running in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "[Push Notifications] Received in foreground:",
          notification.request.content.title,
        );
      });

    // 3. Handle user tapping on a notification banner to navigate
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const data = response.notification.request.content.data;
        if (!data) return;

        const role = await SecureStore.getItemAsync("user_role");

        if (data.type === "new_job") {
          router.push("/(provider-tabs)/jobs" as any);
        } else if (data.type === "new_bid") {
          router.push("/(customer-tabs)/orders" as any);
        } else if (data.type === "bid_accepted") {
          router.push("/(provider-tabs)/tasks" as any);
        } else if (data.type === "chat_message") {
          const targetTab =
            role === "provider"
              ? "/(provider-tabs)/message"
              : "/(customer-tabs)/message";
          router.push({
            pathname: targetTab,
            params: {
              receiverId: data.senderId,
              jobId: data.jobId || "",
            },
          } as any);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <AlertProvider>
        <UnreadMessagesProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="screen/splash" />
            <Stack.Screen name="screen/login" />
            <Stack.Screen name="screen/select-role" />
            <Stack.Screen name="screen/signup" />
            <Stack.Screen name="screen/forgot-password" />
            <Stack.Screen name="screen/service-providers" />
            <Stack.Screen name="screen/sub-services" />
            <Stack.Screen name="screen/user/provider-detail/[id]" />
            <Stack.Screen name="screen/help-support" />
            <Stack.Screen name="(customer-tabs)" />
            <Stack.Screen name="(provider-tabs)" />
          </Stack>
        </UnreadMessagesProvider>
      </AlertProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
