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
    role: string;
  };
  createdAt: string;
}

interface ConversationJob {
  _id: string;
  title: string;
  category: string;
  subcity: string;
  customer?: {
    _id: string;
    fullName: string;
  };
  assignedProvider?: {
    _id: string;
    fullName: string;
  };
}

const SOCKET_URL = "http://10.0.2.2:5000";

export default function MessageTabScreen() {
  const router = useRouter();
  const { jobId, recipientName, receiverId } = useLocalSearchParams();

  // Chat State
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Conversations List State (When no jobId is selected)
  const [conversations, setConversations] = useState<ConversationJob[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 1. Fetch conversations if opened from the bottom bar
  const fetchConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await apiClient.get("/jobs");
      setConversations(res.data);
    } catch (err: any) {
      console.error("Failed to load conversations:", err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      fetchConversations();
    }
  }, [jobId, fetchConversations]);

  // 2. Setup active room if a jobId is present
  useEffect(() => {
    if (!jobId) return;

    let socket: Socket;

    const setupChat = async () => {
      setLoading(true);
      try {
        const storedUserData = await SecureStore.getItemAsync("user_data");
        if (storedUserData) {
          const user = JSON.parse(storedUserData);
          setCurrentUserId(user.id || user._id);
        }

        const res = await apiClient.get(`/messages/${jobId}`);
        setMessages(res.data);

        socket = io(SOCKET_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join_job_room", jobId);
        });

        socket.on("receive_message", (newMsg: MessageItem) => {
          setMessages((prev) => [...prev, newMsg]);
        });
      } catch (err: any) {
        console.error("Chat init error:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [jobId]);

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current || !currentUserId || !jobId)
      return;

    socketRef.current.emit("send_message", {
      jobId,
      senderId: currentUserId,
      receiverId,
      text: inputText.trim(),
    });

    setInputText("");
  };

  // View 1: Conversations List (when tapping Inbox tab)
  if (!jobId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {loadingList ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052CC" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id}
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
                      jobId: item._id,
                      recipientName: item.customer?.fullName || "Client",
                      receiverId: item.customer?._id,
                    },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Feather name="user" size={20} color="#0052CC" />
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>
                    {item.customer?.fullName || "Client"}
                  </Text>
                  <Text style={styles.chatJobTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.chatLocation}>{item.subcity}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Feather name="message-square" size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No conversations yet</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // View 2: Active Chat Room
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.replace("/(provider-tabs)/message")}
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.recipientName}>
            {recipientName || "Job Discussion"}
          </Text>
          <Text style={styles.statusText}>Live Connection</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
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
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            renderItem={({ item }) => {
              const isMine = item.sender?._id === currentUserId;
              return (
                <View
                  style={[
                    styles.messageRow,
                    isMine ? styles.rowRight : styles.rowLeft,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
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
                  </View>
                </View>
              );
            }}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Feather name="send" size={18} color="#FFFFFF" />
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
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitleWrap: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  statusText: { fontSize: 11, color: "#16A34A", fontWeight: "600" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  listContent: { padding: 16, paddingBottom: 100 },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  chatJobTitle: { fontSize: 13, color: "#475569", marginTop: 2 },
  chatLocation: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 10,
  },
  messageList: { padding: 16, paddingBottom: 20 },
  messageRow: { flexDirection: "row", marginVertical: 4 },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleRight: { backgroundColor: "#0052CC", borderBottomRightRadius: 2 },
  bubbleLeft: { backgroundColor: "#E2E8F0", borderBottomLeftRadius: 2 },
  messageText: { fontSize: 14, lineHeight: 20 },
  textRight: { color: "#FFFFFF" },
  textLeft: { color: "#0F172A" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
    marginBottom: Platform.OS === "android" ? 70 : 0,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#94A3B8" },
});
