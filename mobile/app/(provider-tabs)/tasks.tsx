import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";
import { Alert } from "../../src/context/AlertContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

type TaskStatus = "In Progress" | "Completed";

interface CustomerInfo {
  _id: string;
  fullName: string;
  phone?: string;
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

const TABS: TaskStatus[] = ["In Progress", "Completed"];

export default function ProviderTasksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TaskStatus>("In Progress");
  const [tasks, setTasks] = useState<ProviderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await apiClient.get("/jobs/provider-tasks");
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.tasks || [];
      setTasks(list);
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
        recipientPhone: task.customer?.phone,
      },
    });
  };

  // Group backend jobs into tab states
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "In Progress") {
      return task.status === "assigned";
    }
    if (activeTab === "Completed") {
      return task.status === "completed";
    }
    return false;
  });

  const inProgressCount = tasks.filter((t) => t.status === "assigned").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const getTabCount = (tab: TaskStatus) => {
    if (tab === "In Progress") return inProgressCount;
    return completedCount;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Manage accepted bookings and on-site appointments
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <Feather name="refresh-cw" size={moderateScale(16)} color="#0052CC" />
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
                    <Feather
                      name="phone"
                      size={moderateScale(14)}
                      color="#0052CC"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionCircleBtn}
                    onPress={() => handleOpenChat(item)}
                  >
                    <Feather
                      name="message-square"
                      size={moderateScale(14)}
                      color="#0052CC"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location & Time */}
              <View style={styles.detailRow}>
                <Feather
                  name="map-pin"
                  size={moderateScale(13)}
                  color="#64748B"
                />
                <Text style={styles.detailText}>{item.subcity}</Text>
              </View>

              {item.specificLocation ? (
                <View style={styles.landmarkBox}>
                  <Feather
                    name="navigation"
                    size={moderateScale(11)}
                    color="#0284C7"
                  />
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
                          size={moderateScale(12)}
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
                    <Feather
                      name="check"
                      size={moderateScale(12)}
                      color="#16A34A"
                    />
                    <Text style={styles.paidText}>Settled</Text>
                  </View>
                ) : (
                  <View style={styles.inProgressBadge}>
                    <Feather
                      name="clock"
                      size={moderateScale(11)}
                      color="#0052CC"
                    />
                    <Text style={styles.inProgressText}>In Service</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="clipboard"
                size={moderateScale(44)}
                color="#CBD5E1"
              />
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
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTextWrap: { flex: 1, paddingRight: scale(10) },
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
  refreshIconBtn: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    gap: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabItem: {
    flex: 1,
    paddingVertical: scale(9),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  tabItemActive: { backgroundColor: "#0052CC" },
  tabText: { fontSize: scaledFont(12), fontWeight: "700", color: "#64748B" },
  tabTextActive: { color: "#FFFFFF" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: scale(10),
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  listContent: { padding: scale(16), paddingBottom: scale(110) },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: scale(15),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },
  categoryTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  categoryTagText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  badgeActive: { backgroundColor: "#EFF6FF" },
  badgeCompleted: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: scaledFont(10), fontWeight: "700" },
  statusTextActive: { color: "#0052CC" },
  statusTextCompleted: { color: "#16A34A" },
  serviceTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: scale(8),
  },
  customerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: scale(10),
    borderRadius: moderateScale(10),
    marginBottom: scale(10),
  },
  customerInfo: { flex: 1 },
  customerLabel: {
    fontSize: scaledFont(9),
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  customerName: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },
  customerActions: { flexDirection: "row", gap: scale(8) },
  actionCircleBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: scale(4),
  },
  detailText: { fontSize: scaledFont(11), color: "#475569" },
  landmarkBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#F0F9FF",
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: moderateScale(6),
    marginTop: scale(3),
    marginBottom: scale(4),
  },
  landmarkText: {
    fontSize: scaledFont(10),
    color: "#0369A1",
    fontWeight: "500",
  },
  ratingCardContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: moderateScale(10),
    padding: scale(10),
    marginTop: scale(10),
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
    gap: scale(3),
  },
  ratingValueText: {
    fontSize: scaledFont(12),
    fontWeight: "800",
    color: "#B45309",
    marginLeft: scale(4),
  },
  clientReviewedTag: {
    fontSize: scaledFont(9),
    fontWeight: "700",
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: scale(7),
    paddingVertical: scale(2),
    borderRadius: moderateScale(6),
  },
  reviewCommentText: {
    fontSize: scaledFont(11),
    fontStyle: "italic",
    color: "#78350F",
    marginTop: scale(6),
    lineHeight: scale(16),
  },
  noReviewText: {
    fontSize: scaledFont(10),
    fontStyle: "italic",
    color: "#B45309",
    marginTop: scale(4),
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: scale(10),
    paddingTop: scale(10),
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  feeLabel: {
    fontSize: scaledFont(9),
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  feeAmount: { fontSize: scaledFont(14), fontWeight: "800", color: "#0F172A" },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#DCFCE7",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: moderateScale(6),
  },
  paidText: { fontSize: scaledFont(11), fontWeight: "700", color: "#16A34A" },
  inProgressBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: moderateScale(6),
  },
  inProgressText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(60),
    paddingHorizontal: scale(20),
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
  },
});
