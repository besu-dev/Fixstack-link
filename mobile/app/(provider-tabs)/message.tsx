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
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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

interface ClientSummary {
  _id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

interface ProviderConversationItem {
  clientId: string;
  jobId?: string;
  client: ClientSummary;
  jobTitle: string;
  subcity: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

import { SOCKET_URL } from "../../src/config/api";

export default function ProviderMessageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markConversationRead } = useUnreadMessages();
  const { jobId, recipientName, receiverId, recipientPhone, recipientAvatar } =
    useLocalSearchParams<{
      jobId?: string;
      recipientName?: string;
      receiverId?: string;
      recipientPhone?: string;
      recipientAvatar?: string;
    }>();

  // Active Chat State
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Inbox State
  const [conversations, setConversations] = useState<
    ProviderConversationItem[]
  >([]);
  const [loadingList, setLoadingList] = useState(false);
  const [closedChatManually, setClosedChatManually] = useState(false);

  useEffect(() => {
    if (jobId || receiverId) {
      setClosedChatManually(false);
    }
  }, [jobId, receiverId]);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Track keyboard visibility for dynamic input dock spacing
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

  // 1. Get logged-in technician ID
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const stored = await SecureStore.getItemAsync("user_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCurrentUserId(parsed._id || parsed.id);
        }
      } catch (err) {
        console.error("Error reading stored technician data:", err);
      }
    };
    loadCurrentUser();
  }, []);

  // 2. Fetch conversations from /messages/conversations
  const fetchConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiClient.get("/messages/conversations");
      if (Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err: any) {
      console.error(
        "Error fetching provider conversations:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isDirectChatActive) {
        fetchConversations();
      }
    }, [isDirectChatActive, fetchConversations])
  );

  useEffect(() => {
    if (!isDirectChatActive) {
      fetchConversations();
    }
  }, [isDirectChatActive, fetchConversations]);

  // 3. Connect Socket and retrieve past messages
  useEffect(() => {
    if (!isDirectChatActive) return;

    let socket: Socket;

    const setupChat = async () => {
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

        // Fetch historical messages between this technician and client
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
          if (receiverId) {
            markConversationRead(receiverId);
          }
        });
      } catch (err: any) {
        console.error(
          "Chat loading error:",
          err?.response?.data || err.message,
        );
      } finally {
        setLoadingChat(false);
      }
    };

    setupChat();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [jobId, receiverId, currentUserId]);

  // 4. Send Message via Socket & REST fallback
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
  // VIEW 1: DEDUPLICATED INBOX (CLIENT LIST)
  // -------------------------------------------------------------
  const isDirectChatActive = Boolean((jobId || receiverId) && !closedChatManually);

  const handleBackToInbox = () => {
    setClosedChatManually(true);
    router.replace("/(provider-tabs)/message");
  };

  if (!isDirectChatActive) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Client Messages</Text>
          <Text style={styles.headerSubtitle}>
            Direct communication with your active customers
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
            keyExtractor={(item) => item.clientId}
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
                onPress={() => {
                  setClosedChatManually(false);
                  router.push({
                    pathname: "/(provider-tabs)/message",
                    params: {
                      jobId: item.jobId || "",
                      recipientName: item.client?.fullName,
                      receiverId: item.client?._id || item.clientId,
                      recipientPhone: item.client?.phone || "",
                      recipientAvatar: item.client?.avatarUrl || "",
                    },
                  });
                }}
                activeOpacity={0.7}
              >
                <UserAvatar
                  avatarUrl={item.client?.avatarUrl}
                  name={item.client?.fullName || "Client"}
                  size={moderateScale(46)}
                  style={styles.avatarImage}
                />

                <View style={styles.chatInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.chatName}>{item.client.fullName}</Text>
                    <Text style={styles.timeTag}>
                      {formatTimestamp(item.lastMessageTime)}
                    </Text>
                  </View>

                  <View style={styles.msgPreviewRow}>
                    <Text
                      style={[
                        styles.lastMsgText,
                        (item.unreadCount ?? 0) > 0 && styles.lastMsgUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {item.lastMessage}
                    </Text>
                    {(item.unreadCount ?? 0) > 0 && (
                      <View style={styles.convUnreadBadge}>
                        <Text style={styles.convUnreadText}>
                          {(item.unreadCount ?? 0) > 99
                            ? "99+"
                            : item.unreadCount}
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

                <Feather
                  name="chevron-right"
                  size={moderateScale(18)}
                  color="#CBD5E1"
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Feather
                  name="message-square"
                  size={moderateScale(44)}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyTitle}>No active client chats</Text>
                <Text style={styles.emptySubtitle}>
                  Chats will appear here as soon as a client accepts your bid.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LIVE ROOM WITH HISTORY & SENDER AVATARS
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={handleBackToInbox}
          style={styles.backBtn}
        >
          <Feather
            name="chevron-left"
            size={moderateScale(22)}
            color="#0F172A"
          />
        </TouchableOpacity>

        <UserAvatar
          avatarUrl={recipientAvatar}
          name={recipientName || "Customer"}
          size={moderateScale(36)}
          style={{ marginRight: scale(10) }}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.recipientName}>
            {recipientName || "Customer"}
          </Text>
          <View style={styles.statusWrap}>
            <View style={styles.activeDot} />
            <Text style={styles.onlineBadge}>Online</Text>
          </View>
        </View>

        {recipientPhone ? (
          <TouchableOpacity
            style={styles.headerCallBtn}
            onPress={() => Linking.openURL(`tel:${recipientPhone}`)}
          >
            <Feather name="phone" size={moderateScale(16)} color="#0052CC" />
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
                  {/* Incoming Client Profile Avatar */}
                  {!isMine && (
                    <UserAvatar
                      avatarUrl={item.sender?.avatarUrl}
                      name={item.sender?.fullName || recipientName}
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
                        {item.sender?.fullName || recipientName}
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
                <Feather name="lock" size={moderateScale(16)} color="#94A3B8" />
                <Text style={styles.emptyChatText}>
                  Direct client connection established. Coordinate project
                  instructions, access codes, or timeline directly.
                </Text>
              </View>
            }
          />

          {/* Chat Input Dock - elevated above floating bottom navbar */}
          <View
            style={[
              styles.inputBar,
              {
                paddingBottom: isKeyboardVisible
                  ? scale(8)
                  : verticalScale(92) + insets.bottom,
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
              <Feather name="send" size={moderateScale(16)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: scaledFont(20),
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: scaledFont(11),
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
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  emptyTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#334155",
    marginTop: scale(12),
  },
  emptySubtitle: {
    fontSize: scaledFont(12),
    color: "#94A3B8",
    textAlign: "center",
    marginTop: scale(4),
    lineHeight: scale(16),
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
  chatName: { fontSize: scaledFont(14), fontWeight: "700", color: "#0F172A" },
  timeTag: { fontSize: scaledFont(11), color: "#94A3B8" },
  lastMsgText: {
    fontSize: scaledFont(12),
    color: "#475569",
    marginTop: scale(2),
    marginBottom: scale(4),
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
  messageText: { fontSize: scaledFont(13), lineHeight: scale(19) },
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
    lineHeight: scale(17),
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingTop: scale(10),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: scale(8),
  },
  msgPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(2),
    marginBottom: scale(4),
  },
  lastMsgUnread: {
    fontWeight: "700",
    color: "#0F172A",
  },
  convUnreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    minWidth: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: scale(6),
  },
  convUnreadText: {
    color: "#FFFFFF",
    fontSize: scaledFont(10),
    fontWeight: "700",
  },
  textInput: {
    flex: 1,
    height: scale(42),
    borderRadius: moderateScale(21),
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(16),
    fontSize: scaledFont(13),
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
