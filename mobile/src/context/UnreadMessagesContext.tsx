import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Platform, AppState, AppStateStatus } from "react-native";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import messagesApi from "../api/messages";

interface UnreadMessagesContextValue {
  unreadMessageCount: number;
  fetchUnreadCount: () => Promise<void>;
  markConversationRead: (senderId: string) => Promise<void>;
  setUnreadMessageCount: React.Dispatch<React.SetStateAction<number>>;
}

import { SOCKET_URL } from "../config/api";

const UnreadMessagesContext = createContext<UnreadMessagesContextValue>({
  unreadMessageCount: 0,
  fetchUnreadCount: async () => {},
  markConversationRead: async () => {},
  setUnreadMessageCount: () => {},
});

export const UnreadMessagesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 1. Load authenticated user identity
  const loadUser = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync("user_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        const uId = parsed._id || parsed.id;
        setCurrentUserId(uId);
        return uId;
      }
    } catch {
      // silent
    }
    return null;
  }, []);

  // 2. Fetch fresh unread count from API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("user_token");
      if (!token) {
        setUnreadMessageCount(0);
        return;
      }
      const count = await messagesApi.getUnreadCount();
      setUnreadMessageCount(count);
    } catch (err) {
      // silent
    }
  }, []);

  // 3. Mark a conversation as read and update counter
  const markConversationRead = useCallback(
    async (senderId: string) => {
      if (!senderId) return;

      try {
        await messagesApi.markConversationAsRead(senderId);

        if (socketRef.current && currentUserId) {
          socketRef.current.emit("mark_conversation_read", {
            readerId: currentUserId,
            senderId,
          });
        }

        // Re-sync count
        await fetchUnreadCount();
      } catch (err: any) {
        console.error("Error marking conversation as read:", err.message);
      }
    },
    [currentUserId, fetchUnreadCount],
  );

  // 4. Initial load & AppState changes
  useEffect(() => {
    loadUser();
    fetchUnreadCount();

    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          loadUser();
          fetchUnreadCount();
        }
      },
    );

    return () => sub.remove();
  }, [loadUser, fetchUnreadCount]);

  // 5. Socket.io real-time listener for instant badge updates
  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register_user", currentUserId);
    });

    // When an incoming message is received for this user
    socket.on("new_message_notification", (msg: any) => {
      const receiver = msg?.receiver?._id || msg?.receiver;
      if (!receiver || String(receiver) === String(currentUserId)) {
        setUnreadMessageCount((prev) => prev + 1);
      }
    });

    // When messages are marked read
    socket.on("messages_marked_read", () => {
      fetchUnreadCount();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, fetchUnreadCount]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadMessageCount,
        fetchUnreadCount,
        markConversationRead,
        setUnreadMessageCount,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

export default UnreadMessagesContext;
