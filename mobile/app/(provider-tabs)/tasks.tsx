import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";

type TaskStatus = "In Progress" | "Upcoming" | "Completed";

interface CustomerInfo {
  _id: string;
  fullName: string;
  phone: string;
}

interface ReviewInfo {
  rating: number;
  comment?: string;
}

interface ProviderTask {
  _id: string;
  title: string;
  category: string;
  description: string;
  subcity: string;
  specificLocation?: string;
  budget: number;
  urgency: "Emergency" | "Today" | "Flexible";
  status: "open" | "assigned" | "completed" | "cancelled";
  customer?: CustomerInfo;
  review?: ReviewInfo | null;
  createdAt: string;
  updatedAt: string;
}

const TABS: TaskStatus[] = ["In Progress", "Upcoming", "Completed"];

export default function ProviderTasksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TaskStatus>("In Progress");
  const [tasks, setTasks] = useState<ProviderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await apiClient.get("/jobs/provider-tasks");
      setTasks(response.data);
    } catch (err: any) {
      console.error(
        "Failed to load tasks:",
        err?.response?.data || err.message,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleCallCustomer = (phone?: string) => {
    if (!phone) {
      Alert.alert(
        "Contact Unavailable",
        "Customer phone number is not available.",
      );
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Unable to open dialer", phone);
    });
  };

  const handleOpenChat = (task: ProviderTask) => {
    router.push({
      pathname: "/(provider-tabs)/message",
      params: {
        jobId: task._id,
        recipientName: task.customer?.fullName || "Customer",
        receiverId: task.customer?._id,
      },
    });
  };

  // Group backend jobs into tab states
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "In Progress") {
      return task.status === "assigned" && task.urgency === "Emergency";
    }
    if (activeTab === "Upcoming") {
      return task.status === "assigned" && task.urgency !== "Emergency";
    }
    if (activeTab === "Completed") {
      return task.status === "completed";
    }
    return false;
  });

  const inProgressCount = tasks.filter(
    (t) => t.status === "assigned" && t.urgency === "Emergency",
  ).length;
  const upcomingCount = tasks.filter(
    (t) => t.status === "assigned" && t.urgency !== "Emergency",
  ).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const getTabCount = (tab: TaskStatus) => {
    if (tab === "In Progress") return inProgressCount;
    if (tab === "Upcoming") return upcomingCount;
    return completedCount;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Manage accepted bookings and on-site appointments
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshIconBtn} onPress={onRefresh}>
          <Feather name="refresh-cw" size={17} color="#0052CC" />
        </TouchableOpacity>
      </View>

      {/* Segmented Status Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isSelected && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, isSelected && styles.tabTextActive]}
              >
                {tab} ({getTabCount(tab)})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Syncing task roster...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0052CC"]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{item.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "completed"
                      ? styles.badgeCompleted
                      : styles.badgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === "completed"
                        ? styles.statusTextCompleted
                        : styles.statusTextActive,
                    ]}
                  >
                    {item.status === "completed" ? "Completed" : item.urgency}
                  </Text>
                </View>
              </View>

              <Text style={styles.serviceTitle}>{item.title}</Text>

              {/* Customer Info Card */}
              <View style={styles.customerBox}>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerLabel}>Customer</Text>
                  <Text style={styles.customerName}>
                    {item.customer?.fullName || "Verified Client"}
                  </Text>
                </View>
                <View style={styles.customerActions}>
                  <TouchableOpacity
                    style={styles.actionCircleBtn}
                    onPress={() => handleCallCustomer(item.customer?.phone)}
                  >
                    <Feather name="phone" size={15} color="#0052CC" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionCircleBtn}
                    onPress={() => handleOpenChat(item)}
                  >
                    <Feather name="message-square" size={15} color="#0052CC" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location & Time */}
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={14} color="#64748B" />
                <Text style={styles.detailText}>{item.subcity}</Text>
              </View>

              {item.specificLocation ? (
                <View style={styles.landmarkBox}>
                  <Feather name="navigation" size={12} color="#0284C7" />
                  <Text style={styles.landmarkText} numberOfLines={1}>
                    {item.specificLocation}
                  </Text>
                </View>
              ) : null}

              {/* Customer Rating & Review Display */}
              {item.status === "completed" && (
                <View style={styles.ratingCardContainer}>
                  <View style={styles.ratingRow}>
                    <View style={styles.starsWrapper}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FontAwesome
                          key={star}
                          name="star"
                          size={13}
                          color={
                            star <= (item.review?.rating || 0)
                              ? "#F59E0B"
                              : "#CBD5E1"
                          }
                        />
                      ))}
                      <Text style={styles.ratingValueText}>
                        {item.review ? `${item.review.rating}.0` : "Unrated"}
                      </Text>
                    </View>
                    <Text style={styles.clientReviewedTag}>
                      Customer Feedback
                    </Text>
                  </View>

                  {item.review?.comment ? (
                    <Text style={styles.reviewCommentText}>
                      "{item.review.comment}"
                    </Text>
                  ) : (
                    <Text style={styles.noReviewText}>
                      Service finalized without written comment.
                    </Text>
                  )}
                </View>
              )}

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.feeLabel}>Agreed Amount</Text>
                  <Text style={styles.feeAmount}>{item.budget} ETB</Text>
                </View>

                {item.status === "completed" ? (
                  <View style={styles.paidBadge}>
                    <Feather name="check" size={13} color="#16A34A" />
                    <Text style={styles.paidText}>Settled</Text>
                  </View>
                ) : (
                  <View style={styles.inProgressBadge}>
                    <Feather name="clock" size={12} color="#0052CC" />
                    <Text style={styles.inProgressText}>In Service</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>
                No {activeTab.toLowerCase()} tasks
              </Text>
              <Text style={styles.emptySubtitle}>
                Accepted proposals and assigned jobs will show up here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  tabItemActive: { backgroundColor: "#0052CC" },
  tabText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  tabTextActive: { color: "#FFFFFF" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 13, color: "#64748B" },
  listContent: { padding: 16, paddingBottom: 110 },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: { fontSize: 11, fontWeight: "700", color: "#0052CC" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: { backgroundColor: "#EFF6FF" },
  badgeCompleted: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextActive: { color: "#0052CC" },
  statusTextCompleted: { color: "#16A34A" },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  customerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  customerInfo: { flex: 1 },
  customerLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  customerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },
  customerActions: { flexDirection: "row", gap: 8 },
  actionCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  detailText: { fontSize: 12, color: "#475569" },
  landmarkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  landmarkText: { fontSize: 11, color: "#0369A1", fontWeight: "500" },
  ratingCardContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingValueText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B45309",
    marginLeft: 6,
  },
  clientReviewedTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reviewCommentText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#78350F",
    marginTop: 6,
    lineHeight: 18,
  },
  noReviewText: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#B45309",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  feeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  feeAmount: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },
  inProgressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inProgressText: { fontSize: 11, fontWeight: "700", color: "#0052CC" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
    paddingHorizontal: 20,
  },
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
    marginTop: 4,
  },
});
