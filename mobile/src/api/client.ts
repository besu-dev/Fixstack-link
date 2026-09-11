import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "../config/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout to allow large file/photo uploads and Cloudinary processing
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("user_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If sending FormData in React Native, remove explicit Content-Type so the native
  // networking layer automatically appends the multipart/form-data boundary parameter.
  if (config.data instanceof FormData) {
    if (config.headers) {
      if (typeof (config.headers as any).delete === "function") {
        (config.headers as any).delete("Content-Type");
        (config.headers as any).delete("content-type");
      } else {
        delete config.headers["Content-Type"];
        delete (config.headers as any)["content-type"];
      }
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      if (!error.response) {
        console.warn(
          `[Bete Network Error] Cannot reach server at: ${error.config?.baseURL || API_BASE_URL}${error.config?.url || ""}. Check that your backend is running and phone is on the same Wi-Fi.`,
          error.message
        );
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
