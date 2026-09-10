import apiClient from "./client";
import { User, ProviderDetails } from "../types";

export const usersApi = {
  /**
   * Fetch public profile of a technician/provider by their ID
   *
   */
  getProviderProfile: async (id: string) => {
    const res = await apiClient.get(`/auth/provider/${id}`);
    return res.data?.user || res.data;
  },

  /**
   * Fetch directory of all available providers with optional category/search filters
   */
  getProvidersList: async (params?: {
    category?: string;
    subcity?: string;
    search?: string;
  }): Promise<any[]> => {
    const res = await apiClient.get("/auth/providers", { params });
    return Array.isArray(res.data) ? res.data : res.data?.providers || [];
  },

  /**
   * Fetch profile of the currently authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get("/auth/me");
    return res.data?.user || res.data;
  },
};

export default usersApi;
