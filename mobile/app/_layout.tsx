import { Stack } from "expo-router";
import { AlertProvider } from "../src/context/AlertContext";
import { UnreadMessagesProvider } from "../src/context/UnreadMessagesContext";

export default function RootLayout() {
  return (
    <AlertProvider>
      <UnreadMessagesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="screen/splash" />
          <Stack.Screen name="screen/login" />
          <Stack.Screen name="screen/select-role" />
          <Stack.Screen name="screen/signup" />
          <Stack.Screen name="screen/forgot-password" />
          <Stack.Screen name="screen/service-providers" />
          <Stack.Screen name="screen/user/provider-detail/[id]" />
          <Stack.Screen name="(customer-tabs)" />
          <Stack.Screen name="(provider-tabs)" />
        </Stack>
      </UnreadMessagesProvider>
    </AlertProvider>
  );
}
