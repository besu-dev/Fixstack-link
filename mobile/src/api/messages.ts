import apiClient from "./client";

export interface UnreadMessageCountResponse {
  count: number;
}

export const messagesApi = {
  /**
   * Get the total count of unread messages for the logged in user
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<UnreadMessageCountResponse>(
        "/messages/unread-count",
      );
      return res.data?.count ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark all messages from a specific sender as read
   */
  markConversationAsRead: async (senderId: string): Promise<boolean> => {
    try {
      if (!senderId) return false;
      await apiClient.patch(`/messages/read/${senderId}`);
      return true;
    } catch (err: any) {
      console.error("Failed to mark conversation read:", err.message);
      return false;
    }
  },

  /**
   * Get messages for a job / conversation
   */
  getMessages: async (jobId: string, receiverId?: string) => {
    const res = await apiClient.get(`/messages/${jobId}`, {
      params: receiverId ? { receiverId } : undefined,
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Send a new chat message
   */
  sendMessage: async (data: {
    jobId?: string;
    receiverId?: string;
    text: string;
  }) => {
    const res = await apiClient.post("/messages", data);
    return res.data;
  },
};

export default messagesApi;
