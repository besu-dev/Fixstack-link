import apiClient from "./client";
import { JobNotification, UnreadCountResponse } from "../types";

export const notificationsApi = {
  /**
   * Fetch notifications for the current authenticated user
   */
  getNotifications: async (): Promise<JobNotification[]> => {
    const res = await apiClient.get("/notifications");
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Get the count of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<UnreadCountResponse>(
        "/notifications/unread-count",
      );
      return res.data?.count ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (notificationId: string): Promise<JobNotification> => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },
};

export default notificationsApi;
