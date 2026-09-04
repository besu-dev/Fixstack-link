import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Use 10.0.2.2 for Android Studio Emulator, or your local machine IPv4 address for physical devices
const API_BASE_URL = "http://10.0.2.2:5000/api";

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

export default apiClient;
