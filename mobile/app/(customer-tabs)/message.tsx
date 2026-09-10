import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../src/api/client";
import {
  scale,
  verticalScale,
  moderateScale,
  scaledFont,
} from "../../src/utils/responsive";
import { useUnreadMessages } from "../../src/context/UnreadMessagesContext";
import UserAvatar from "../../components/common/UserAvatar";

interface MessageItem {
  _id: string;
  text: string;
  sender: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    role?: string;
  };
  createdAt: string;
}

interface ProviderSummary {
  _id: string;
  fullName: string;
  phone?: string;
  profession?: string;
  rating?: number;
  avatarUrl?: string;
}

interface ConversationItem {
  providerId: string;
  jobId: string;
  provider: ProviderSummary;
  jobTitle: string;
  subcity: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

import { SOCKET_URL } from "../../src/config/api";

export default function CustomerMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markConversationRead, fetchUnreadCount: refreshGlobalUnread } =
    useUnreadMessages();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const { jobId, recipientName, receiverId, recipientPhone, recipientAvatar } =
    useLocalSearchParams<{
      jobId?: string;
      recipientName?: string;
      receiverId?: string;
      recipientPhone?: string;
      recipientAvatar?: string;
    }>();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Track keyboard visibility for dynamic bottom inset adjustments
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Scroll to bottom when keyboard opens to keep conversation in view
  useEffect(() => {
    if (isKeyboardVisible) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isKeyboardVisible]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const stored = await SecureStore.getItemAsync("user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUserId(parsed._id || parsed.id);
        }
      } catch (err) {
        console.error("Failed to load user credentials:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiClient.get("/jobs/my-jobs");
      const assignedJobs = res.data.filter(
        (j: any) => j.assignedProvider && j.assignedProvider._id,
      );

      const providerMap = new Map<string, ConversationItem>();

      for (const job of assignedJobs) {
        const pId = job.assignedProvider._id;
        if (!providerMap.has(pId)) {
          providerMap.set(pId, {
            providerId: pId,
            jobId: job._id,
            provider: job.assignedProvider,
            jobTitle: job.title,
            subcity: job.subcity,
            lastMessage: "Tap to open chat history",
            lastMessageTime: job.updatedAt || job.createdAt,
          });
        }
      }

      const convArray = Array.from(providerMap.values());

      const hydratedConversations = await Promise.all(
        convArray.map(async (conv) => {
          try {
            const msgRes = await apiClient.get(
              `/messages/${conv.jobId}?receiverId=${conv.providerId}`,
            );
            if (Array.isArray(msgRes.data) && msgRes.data.length > 0) {
              const latestMsg = msgRes.data[msgRes.data.length - 1];
              const unread = msgRes.data.filter(
                (m: any) =>
                  !m.read &&
                  (m.sender?._id === conv.providerId ||
                    m.sender === conv.providerId),
              ).length;
              return {
                ...conv,
                lastMessage: latestMsg.text,
                lastMessageTime: latestMsg.createdAt,
                unreadCount: unread,
              };
            }
          } catch {
            // Keep fallback placeholder
          }
          return conv;
        }),
      );

      setConversations(hydratedConversations);
    } catch (err: any) {
      console.error(
        "Error loading chat list:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId && !receiverId) {
      fetchConversations();
    }
  }, [jobId, receiverId, fetchConversations]);

  useEffect(() => {
    if (!jobId && !receiverId) return;

    let socket: Socket;

    const initActiveChat = async () => {
      setLoadingChat(true);
      try {
        let myId = currentUserId;
        if (!myId) {
          const stored = await SecureStore.getItemAsync("user_data");
          if (stored) {
            const parsed = JSON.parse(stored);
            myId = parsed._id || parsed.id;
            setCurrentUserId(myId);
          }
        }

        const url = receiverId
          ? `/messages/${jobId || "direct"}?receiverId=${receiverId}`
          : `/messages/${jobId}`;

        const res = await apiClient.get(url);
        setMessages(Array.isArray(res.data) ? res.data : []);

        // Clear unread count for this conversation
        if (receiverId) {
          markConversationRead(receiverId);
        }

        socket = io(SOCKET_URL, {
          transports: ["websocket"],
          forceNew: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join_chat_room", {
            userId1: myId,
            userId2: receiverId,
            jobId,
          });
        });

        socket.on("receive_message", (newMsg: MessageItem) => {
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
          // User is actively reading this conversation
          if (receiverId) {
            markConversationRead(receiverId);
          }
        });
      } catch (err: any) {
        console.error("Chat setup error:", err?.response?.data || err.message);
      } finally {
        setLoadingChat(false);
      }
    };

    initActiveChat();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [jobId, receiverId, currentUserId]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    let senderId = currentUserId;
    if (!senderId) {
      try {
        const stored = await SecureStore.getItemAsync("user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          senderId = parsed._id || parsed.id;
          if (senderId) setCurrentUserId(senderId);
        }
      } catch (err) {
        console.error("Error retrieving user info:", err);
      }
    }
    if (!senderId) return;

    const payload = {
      jobId: jobId || undefined,
      senderId,
      receiverId,
      text: trimmed,
    };

    setInputText("");

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", payload);
    } else {
      try {
        const res = await apiClient.post("/messages", {
          jobId: jobId || undefined,
          receiverId,
          text: trimmed,
        });
        setMessages((prev) => [...prev, res.data]);
      } catch (err: any) {
        console.error(
          "Failed to deliver message:",
          err?.response?.data || err.message,
        );
      }
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // -------------------------------------------------------------
  // VIEW 1: INBOX CONVERSATIONS LIST
  // -------------------------------------------------------------
  const isDirectChatActive = Boolean(jobId || receiverId);
  if (!isDirectChatActive) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            Direct chat with verified technicians
          </Text>
        </View>

        {loadingList ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052CC" />
            <Text style={styles.syncText}>Syncing chats...</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.providerId}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={loadingList}
                onRefresh={fetchConversations}
                colors={["#0052CC"]}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chatCard}
                onPress={() =>
                  router.push({
                    pathname: "/(customer-tabs)/message",
                    params: {
                      jobId: item.jobId,
                      recipientName: item.provider.fullName,
                      receiverId: item.provider._id,
                      recipientPhone: item.provider.phone,
                      recipientAvatar: item.provider.avatarUrl,
                    },
                  })
                }
                activeOpacity={0.7}
              >
                <UserAvatar
                  avatarUrl={item.provider?.avatarUrl}
                  name={item.provider?.fullName || "Provider"}
                  size={moderateScale(46)}
                  style={styles.avatarImage}
                />

                <View style={styles.chatInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.chatName}>
                      {item.provider.fullName}
                    </Text>
                    <Text style={styles.timeTag}>
                      {formatTimestamp(item.lastMessageTime)}
                    </Text>
                  </View>

                  <View style={styles.msgPreviewRow}>
                    <Text
                      style={[
                        styles.lastMsgText,
                        item.unreadCount ? styles.lastMsgUnread : null,
                      ]}
                      numberOfLines={1}
                    >
                      {item.lastMessage}
                    </Text>
                    {item.unreadCount !== undefined && item.unreadCount > 0 && (
                      <View style={styles.convUnreadBadge}>
                        <Text style={styles.convUnreadText}>
                          {item.unreadCount > 9 ? "9+" : item.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.badgeText}>{item.jobTitle}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.locationText}>{item.subcity}</Text>
                  </View>
                </View>

                <Feather name="chevron-right" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Feather name="message-square" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No active conversations</Text>
                <Text style={styles.emptySubtitle}>
                  Chats will appear automatically once a provider accepts your
                  job or submits a quote.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LIVE CHAT ROOM WITH PROFILE AVATARS
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(customer-tabs)/message");
            }
          }}
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <UserAvatar
          avatarUrl={recipientAvatar}
          name={recipientName || "Service Provider"}
          size={moderateScale(36)}
          style={{ marginRight: scale(10) }}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.recipientName}>
            {recipientName || "Service Provider"}
          </Text>
          <View style={styles.statusWrap}>
            <View style={styles.activeDot} />
            <Text style={styles.onlineBadge}>Live Session</Text>
          </View>
        </View>

        {recipientPhone ? (
          <TouchableOpacity
            style={styles.headerCallBtn}
            onPress={() => Linking.openURL(`tel:${recipientPhone}`)}
          >
            <Feather name="phone" size={16} color="#0052CC" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loadingChat ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.syncText}>Loading conversation...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          style={styles.flex}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id || Math.random().toString()}
            contentContainerStyle={[
              styles.messageList,
              { paddingBottom: verticalScale(16) },
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              const isMine =
                item.sender?._id === currentUserId ||
                item.sender === (currentUserId as any);

              return (
                <View
                  style={[
                    styles.messageRow,
                    isMine ? styles.rowRight : styles.rowLeft,
                  ]}
                >
                  {/* Avatar for the other user */}
                  {!isMine && (
                    <UserAvatar
                      avatarUrl={item.sender?.avatarUrl || recipientAvatar}
                      name={item.sender?.fullName || recipientName || "Service Provider"}
                      size={moderateScale(28)}
                      style={styles.msgAvatar}
                    />
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleRight : styles.bubbleLeft,
                    ]}
                  >
                    {!isMine && (
                      <Text style={styles.senderNameLabel}>
                        {item.sender?.fullName || recipientName || "Provider"}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        isMine ? styles.textRight : styles.textLeft,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <Text
                      style={[
                        styles.timeText,
                        isMine ? styles.timeRight : styles.timeLeft,
                      ]}
                    >
                      {formatTimestamp(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyChatBox}>
                <Feather name="message-circle" size={20} color="#0052CC" />
                <Text style={styles.emptyChatText}>
                  {jobId
                    ? "Messages are end-to-end coordinated for this service order."
                    : `Start a direct conversation with ${recipientName || "this service provider"}. Ask questions, discuss issues, or request quotes.`}
                </Text>
              </View>
            }
          />

          {/* Bottom Message Input Bar - elevated above floating bottom navbar */}
          <View
            style={[
              styles.inputBar,
              {
                paddingBottom: isKeyboardVisible
                  ? scale(8)
                  : verticalScale(88) + insets.bottom,
              },
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Write a message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Feather name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: scaledFont(22),
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: scale(4), marginRight: scale(8) },
  headerInfo: { flex: 1 },
  recipientName: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    marginTop: 1,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#16A34A",
  },
  onlineBadge: {
    fontSize: scaledFont(11),
    color: "#16A34A",
    fontWeight: "600",
  },
  headerCallBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },
  syncText: {
    marginTop: scale(10),
    fontSize: scaledFont(13),
    color: "#64748B",
  },
  emptyTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#334155",
    marginTop: scale(12),
  },
  emptySubtitle: {
    fontSize: scaledFont(13),
    color: "#94A3B8",
    textAlign: "center",
    marginTop: scale(6),
    lineHeight: scale(18),
  },
  listContent: { padding: scale(16), paddingBottom: scale(100) },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatarImage: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: "#E2E8F0",
    marginRight: scale(12),
  },
  chatInfo: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: { fontSize: scaledFont(15), fontWeight: "700", color: "#0F172A" },
  timeTag: { fontSize: scaledFont(11), color: "#94A3B8" },
  msgPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(2),
    marginBottom: scale(4),
  },
  lastMsgText: {
    fontSize: scaledFont(13),
    color: "#475569",
    flex: 1,
  },
  lastMsgUnread: {
    fontWeight: "700",
    color: "#0F172A",
  },
  convUnreadBadge: {
    backgroundColor: "#DC2626",
    borderRadius: scale(8),
    minWidth: scale(16),
    height: scale(16),
    paddingHorizontal: scale(4),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: scale(6),
  },
  convUnreadText: {
    color: "#FFFFFF",
    fontSize: scaledFont(9),
    fontWeight: "800",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: scale(6) },
  badgeText: { fontSize: scaledFont(11), fontWeight: "700", color: "#0052CC" },
  dot: { fontSize: scaledFont(11), color: "#CBD5E1" },
  locationText: { fontSize: scaledFont(11), color: "#64748B" },
  messageList: { padding: scale(16), paddingBottom: scale(24) },
  messageRow: {
    flexDirection: "row",
    marginVertical: scale(4),
    alignItems: "flex-end",
  },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  msgAvatar: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    marginRight: scale(6),
    marginBottom: scale(2),
  },
  bubble: {
    maxWidth: "76%",
    paddingHorizontal: scale(14),
    paddingVertical: scale(9),
    borderRadius: moderateScale(16),
  },
  bubbleRight: { backgroundColor: "#0052CC", borderBottomRightRadius: 3 },
  bubbleLeft: { backgroundColor: "#E2E8F0", borderBottomLeftRadius: 3 },
  senderNameLabel: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
    marginBottom: scale(2),
  },
  messageText: { fontSize: scaledFont(14), lineHeight: scale(20) },
  textRight: { color: "#FFFFFF" },
  textLeft: { color: "#0F172A" },
  timeText: {
    fontSize: scaledFont(10),
    marginTop: scale(3),
    alignSelf: "flex-end",
  },
  timeRight: { color: "#BFDBFE" },
  timeLeft: { color: "#64748B" },
  emptyChatBox: {
    alignItems: "center",
    padding: scale(20),
    marginTop: scale(40),
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  emptyChatText: {
    fontSize: scaledFont(12),
    color: "#64748B",
    textAlign: "center",
    lineHeight: scale(18),
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: scale(10),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: scale(8),
  },
  textInput: {
    flex: 1,
    height: scale(42),
    borderRadius: moderateScale(21),
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(16),
    fontSize: scaledFont(14),
    color: "#0F172A",
  },
  sendButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { backgroundColor: "#CBD5E1" },
});
