import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { API_BASE_URL } from "../config/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("user_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      if (!error.response) {
        console.warn(
          `[FixLink Network Error] Cannot reach server at: ${error.config?.baseURL || API_BASE_URL}${error.config?.url || ""}. Check that your backend is running and phone is on the same Wi-Fi.`,
          error.message
        );
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
