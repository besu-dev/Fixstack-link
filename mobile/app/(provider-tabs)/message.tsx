import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../src/api/client";

interface MessageItem {
  _id: string;
  text: string;
  sender: {
    _id: string;
    fullName: string;
    role?: string;
  };
  createdAt: string;
}

interface ClientSummary {
  _id: string;
  fullName: string;
  phone?: string;
}

interface ProviderConversationItem {
  clientId: string;
  jobId: string;
  client: ClientSummary;
  jobTitle: string;
  subcity: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const SOCKET_URL = "http://10.0.2.2:5000";

export default function ProviderMessageScreen() {
  const router = useRouter();
  const { jobId, recipientName, receiverId, recipientPhone } =
    useLocalSearchParams<{
      jobId?: string;
      recipientName?: string;
      receiverId?: string;
      recipientPhone?: string;
    }>();

  // Active Chat State
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  // Inbox State
  const [conversations, setConversations] = useState<
    ProviderConversationItem[]
  >([]);
  const [loadingList, setLoadingList] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

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

  // 2. Fetch conversations deduplicated strictly per customer
  const fetchConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiClient.get("/jobs/provider-tasks");
      const assignedJobs = res.data.filter(
        (j: any) => j.customer && (j.customer._id || j.customer.id),
      );

      // Single card per client
      const clientMap = new Map<string, ProviderConversationItem>();

      for (const job of assignedJobs) {
        const cId = job.customer._id || job.customer.id;
        if (!clientMap.has(cId)) {
          clientMap.set(cId, {
            clientId: cId,
            jobId: job._id,
            client: job.customer,
            jobTitle: job.title,
            subcity: job.subcity,
            lastMessage: "Tap to open chat history",
            lastMessageTime: job.updatedAt || job.createdAt,
          });
        }
      }

      const convArray = Array.from(clientMap.values());

      // Fetch last message preview
      const hydrated = await Promise.all(
        convArray.map(async (conv) => {
          try {
            const msgRes = await apiClient.get(
              `/messages/${conv.jobId}?receiverId=${conv.clientId}`,
            );
            if (Array.isArray(msgRes.data) && msgRes.data.length > 0) {
              const latest = msgRes.data[msgRes.data.length - 1];
              return {
                ...conv,
                lastMessage: latest.text,
                lastMessageTime: latest.createdAt,
              };
            }
          } catch (e) {
            // Keep default placeholder
          }
          return conv;
        }),
      );

      setConversations(hydrated);
    } catch (err: any) {
      console.error(
        "Error fetching provider conversations:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      fetchConversations();
    }
  }, [jobId, fetchConversations]);

  // 3. Connect Socket and retrieve past messages
  useEffect(() => {
    if (!jobId && !receiverId) return;

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
  }, [jobId, receiverId]);

  // 4. Send Message via Socket & REST fallback
  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !currentUserId) return;

    const payload = {
      jobId: jobId || undefined,
      senderId: currentUserId,
      receiverId,
      text: trimmed,
    };

    setInputText("");

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", payload);
    } else {
      try {
        const res = await apiClient.post("/messages", {
          jobId,
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
  if (!jobId) {
    return (
      <SafeAreaView style={styles.safeArea}>
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
                onPress={() =>
                  router.push({
                    pathname: "/(provider-tabs)/message",
                    params: {
                      jobId: item.jobId,
                      recipientName: item.client.fullName,
                      receiverId: item.client._id,
                      recipientPhone: item.client.phone,
                    },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Feather name="user" size={20} color="#0052CC" />
                </View>

                <View style={styles.chatInfo}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.chatName}>{item.client.fullName}</Text>
                    <Text style={styles.timeTag}>
                      {formatTimestamp(item.lastMessageTime)}
                    </Text>
                  </View>

                  <Text style={styles.lastMsgText} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>

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
  // VIEW 2: LIVE ROOM WITH HISTORY
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Bar */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => router.replace("/(provider-tabs)/message")}
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.recipientName}>
            {recipientName || "Customer"}
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id || Math.random().toString()}
            contentContainerStyle={styles.messageList}
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
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleRight : styles.bubbleLeft,
                    ]}
                  >
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
                <Feather name="lock" size={16} color="#94A3B8" />
                <Text style={styles.emptyChatText}>
                  Direct client connection established. Coordinate project
                  instructions, access codes, or timeline directly.
                </Text>
              </View>
            }
          />

          {/* Chat Dock */}
          <View style={styles.inputBar}>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#16A34A",
  },
  onlineBadge: { fontSize: 11, color: "#16A34A", fontWeight: "600" },
  headerCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  syncText: { marginTop: 10, fontSize: 13, color: "#64748B" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  listContent: { padding: 16, paddingBottom: 100 },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatInfo: { flex: 1 },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  timeTag: { fontSize: 11, color: "#94A3B8" },
  lastMsgText: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
    marginBottom: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#0052CC" },
  dot: { fontSize: 11, color: "#CBD5E1" },
  locationText: { fontSize: 11, color: "#64748B" },
  messageList: { padding: 16, paddingBottom: 24 },
  messageRow: { flexDirection: "row", marginVertical: 4 },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  bubbleRight: { backgroundColor: "#0052CC", borderBottomRightRadius: 3 },
  bubbleLeft: { backgroundColor: "#E2E8F0", borderBottomLeftRadius: 3 },
  messageText: { fontSize: 14, lineHeight: 20 },
  textRight: { color: "#FFFFFF" },
  textLeft: { color: "#0F172A" },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  timeRight: { color: "#BFDBFE" },
  timeLeft: { color: "#64748B" },
  emptyChatBox: {
    alignItems: "center",
    padding: 20,
    marginTop: 40,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    gap: 8,
  },
  emptyChatText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
    marginBottom: Platform.OS === "android" ? 70 : 0,
  },
  textInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { backgroundColor: "#CBD5E1" },
});
