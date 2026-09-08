import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import notificationsApi from "../../src/api/notifications";
import { JobNotification } from "../../src/types";
import UserAvatar from "../common/UserAvatar";
import {
  scale,
  moderateScale,
  scaledFont,
  verticalScale,
} from "../../src/utils/responsive";

interface CustomerNotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  initialUnreadCount?: number;
}

// Relative time formatter helper
const formatRelativeTime = (dateString?: string, fallback = "Just now"): string => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallback;
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSec < 60) return "Just now";
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 604800) return `${Math.floor(diffInSec / 86400)}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CustomerNotificationsModal({
  visible,
  onClose,
  onUnreadCountChange,
  initialUnreadCount = 0,
}: CustomerNotificationsModalProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);

      const unread = data.filter((n) => !n.read).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(unread);
      }
    } catch (err) {
      console.warn("Failed to load customer notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (item: JobNotification) => {
    if (!item.read) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)),
      );
      try {
        await notificationsApi.markAsRead(item._id);
        const newUnread = notifications.filter(
          (n) => !n.read && n._id !== item._id,
        ).length;
        if (onUnreadCountChange) {
          onUnreadCountChange(newUnread);
        }
      } catch (err) {
        console.warn("Failed to mark notification as read:", err);
      }
    }

    // Close modal and navigate to orders tab so customer can review proposal
    onClose();
    router.push("/(customer-tabs)/orders" as any);
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (onUnreadCountChange) {
      onUnreadCountChange(0);
    }
    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadTotal = notifications.filter((n) => !n.read).length;

  const renderItem = ({ item }: { item: JobNotification }) => {
    const isProposal = item.type === "new_proposal" || Boolean(item.provider);
    const providerName =
      item.provider?.fullName || item.providerName || "Service Provider";
    const providerProfession =
      item.provider?.profession || item.serviceName || "Certified Technician";
    const status = item.proposalStatus || "pending";

    const getStatusBadge = () => {
      if (status === "accepted") {
        return { label: "Accepted", bg: "#DCFCE7", text: "#16A34A" };
      }
      if (status === "rejected") {
        return { label: "Declined", bg: "#FEE2E2", text: "#DC2626" };
      }
      return { label: "New Proposal", bg: "#EFF6FF", text: "#0052CC" };
    };

    const badge = getStatusBadge();

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        activeOpacity={0.78}
        onPress={() => handleMarkAsRead(item)}
      >
        {/* Left: Provider Avatar or Icon */}
        <View style={styles.avatarContainer}>
          {item.provider ? (
            <UserAvatar
              avatarUrl={item.provider.avatarUrl}
              name={providerName}
              size={moderateScale(48)}
            />
          ) : (
            <View style={styles.iconCircle}>
              <Feather name="file-text" size={moderateScale(22)} color="#0052CC" />
            </View>
          )}
          {item.provider?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(10)}
                color="#FFFFFF"
              />
            </View>
          )}
        </View>

        {/* Center: Notification Details */}
        <View style={styles.contentCol}>
          <View style={styles.topRow}>
            <Text style={styles.providerName} numberOfLines={1}>
              {providerName}
            </Text>
            <Text style={styles.timeText}>
              {formatRelativeTime(item.createdAt, item.timePosted)}
            </Text>
          </View>

          <Text style={styles.professionText} numberOfLines={1}>
            {providerProfession}
          </Text>

          {/* Service / Request Name */}
          <View style={styles.jobRow}>
            <Feather
              name="clipboard"
              size={moderateScale(12)}
              color="#64748B"
              style={{ marginTop: 2 }}
            />
            <Text style={styles.jobTitle} numberOfLines={1}>
              Request: <Text style={styles.jobTitleBold}>{item.jobTitle}</Text>
            </Text>
          </View>

          {/* Proposal Price & Status Row */}
          <View style={styles.bottomMetaRow}>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>

            {item.proposalPrice !== undefined && item.proposalPrice !== null && (
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>
                  Quote: {item.proposalPrice} ETB
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }} />

            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>Review</Text>
              <Feather
                name="chevron-right"
                size={moderateScale(13)}
                color="#0052CC"
              />
            </View>
          </View>
        </View>

        {/* Unread Indicator Dot */}
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Modal Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={moderateScale(20)} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadTotal > 0 && (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>{unreadTotal} new</Text>
              </View>
            )}
          </View>

          {unreadTotal > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              disabled={markingAll}
              activeOpacity={0.7}
              style={styles.markAllBtn}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: scale(40) }} />
          )}
        </View>

        {/* Filter Bar: All vs Unread */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("all")}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "all" && styles.filterTabTextActive,
              ]}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "unread" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("unread")}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "unread" && styles.filterTabTextActive,
              ]}
            >
              Unread ({unreadTotal})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052CC" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="bell" size={moderateScale(32)} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              Whenever a service provider submits a quote or proposal for your requests,
              you will receive an instant notification here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0052CC"]}
              />
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  headerTitle: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
  },
  unreadPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  unreadPillText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#0052CC",
  },
  markAllBtn: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
  },
  markAllText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#0052CC",
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: "#FFFFFF",
    gap: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterTab: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: moderateScale(16),
    backgroundColor: "#F1F5F9",
  },
  filterTabActive: {
    backgroundColor: "#0052CC",
  },
  filterTabText: {
    fontSize: scaledFont(12.5),
    fontWeight: "600",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    padding: scale(16),
    paddingBottom: scale(40),
    gap: scale(12),
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  notifCardUnread: {
    backgroundColor: "#F0F7FF",
    borderColor: "#BFDBFE",
  },
  avatarContainer: {
    position: "relative",
    marginRight: scale(12),
  },
  iconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  contentCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  providerName: {
    fontSize: scaledFont(14.5),
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: scale(8),
  },
  timeText: {
    fontSize: scaledFont(11),
    color: "#94A3B8",
    fontWeight: "500",
  },
  professionText: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginBottom: scale(6),
  },
  jobRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(4),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(5),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(8),
  },
  jobTitle: {
    fontSize: scaledFont(12),
    color: "#475569",
    flex: 1,
  },
  jobTitleBold: {
    fontWeight: "700",
    color: "#0F172A",
  },
  bottomMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  statusBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  statusBadgeText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
  },
  priceTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  priceTagText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#1E293B",
  },
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionHintText: {
    fontSize: scaledFont(11.5),
    fontWeight: "700",
    color: "#0052CC",
  },
  unreadDot: {
    position: "absolute",
    top: scale(14),
    right: scale(14),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#0052CC",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
  },
  loadingText: {
    fontSize: scaledFont(13),
    color: "#64748B",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(32),
    gap: scale(10),
  },
  emptyIconCircle: {
    width: moderateScale(68),
    height: moderateScale(68),
    borderRadius: moderateScale(34),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(4),
  },
  emptyTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: scaledFont(12.5),
    color: "#64748B",
    textAlign: "center",
    lineHeight: scaledFont(18),
  },
});
