import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="screen/splash" />
      <Stack.Screen name="screen/login" />
      <Stack.Screen name="screen/select-role" />
      <Stack.Screen name="screen/signup" />
      <Stack.Screen name="screen/forgot-password" />
      <Stack.Screen name="(customer-tabs)" />
      <Stack.Screen name="(provider-tabs)" />
    </Stack>
  );
}
