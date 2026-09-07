import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolves the development server host dynamically.
 * In Expo Go, `Constants.expoConfig?.hostUri` contains the host IP and port of the development PC
 * (e.g. "192.168.1.5:8081"), allowing physical devices to seamlessly connect to the backend on the same LAN.
 */
export const getDevServerHost = (): string => {
  // 1. Explicit environment variable override (if configured in .env)
  if (process.env.EXPO_PUBLIC_DEV_HOST) {
    return process.env.EXPO_PUBLIC_DEV_HOST;
  }

  // 2. Dynamic resolution from Expo's hostUri (works for Expo Go on physical device & emulator)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return ip;
    }
  }

  // 3. Check debuggerHost on manifest2 / manifest
  const manifestHost =
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants.manifest as any)?.debuggerHost;
  if (manifestHost) {
    const ip = manifestHost.split(":")[0];
    if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
      return ip;
    }
  }

  // 4. Check experienceUrl if present (e.g., "exp://192.168.1.5:8081")
  if (Constants.experienceUrl) {
    const match = Constants.experienceUrl.match(/:\/\/([^:/]+)/);
    if (match && match[1] && match[1] !== "localhost" && match[1] !== "127.0.0.1") {
      return match[1];
    }
  }

  // 5. Default Android Emulator loopback
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  // 6. Default localhost (iOS Simulator / Web)
  return "localhost";
};

const DEV_HOST = getDevServerHost();
const PORT = 5000;

// Base API URL (e.g. http://192.168.1.5:5000/api)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? `http://${DEV_HOST}:${PORT}/api` : "https://api.fixlink.et/api");

// Base Socket / Server URL (e.g. http://192.168.1.5:5000)
export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  (__DEV__ ? `http://${DEV_HOST}:${PORT}` : "https://api.fixlink.et");

export const SERVER_BASE_URL = SOCKET_URL;

if (__DEV__) {
  console.log(`[FixLink API] Resolved Host: ${DEV_HOST}`);
  console.log(`[FixLink API] Base URL: ${API_BASE_URL}`);
  console.log(`[FixLink API] Socket URL: ${SOCKET_URL}`);
}
