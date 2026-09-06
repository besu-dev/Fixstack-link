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
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../../src/api/client";
import notificationsApi from "../../src/api/notifications";
import { JobNotification, JobUrgency } from "../../src/types";
import BuyConnectsModal from "../BuyConnectsModal";
import { Alert } from "../../src/context/AlertContext";
import {
  scale,
  moderateScale,
  scaledFont,
  verticalScale,
} from "../../src/utils/responsive";

interface JobNotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
  initialUnreadCount?: number;
}

const DURATION_OPTIONS = ["1-2 hours", "Half Day", "Full Day", "2+ Days"];

// Helper for relative time formatting
const formatTimeAgo = (dateString?: string, fallback?: string): string => {
  if (!dateString) return fallback || "Just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return fallback || "Just now";
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Helper for category styling & icons
const getCategoryDetails = (category: string) => {
  const cat = (category || "").toLowerCase();
  if (cat.includes("plumb")) {
    return { iconName: "droplet" as const, color: "#0284C7", bg: "#E0F2FE" };
  }
  if (cat.includes("electr")) {
    return { iconName: "zap" as const, color: "#D97706", bg: "#FEF3C7" };
  }
  if (cat.includes("solar")) {
    return { iconName: "sun" as const, color: "#EA580C", bg: "#FFEDD5" };
  }
  if (cat.includes("air") || cat.includes("ac")) {
    return { iconName: "wind" as const, color: "#0891B2", bg: "#CFFAFE" };
  }
  if (cat.includes("appliance") || cat.includes("mitad")) {
    return { iconName: "tv" as const, color: "#7C3AED", bg: "#EDE9FE" };
  }
  if (cat.includes("gate") || cat.includes("metal") || cat.includes("carpent")) {
    return { iconName: "shield" as const, color: "#475569", bg: "#F1F5F9" };
  }
  return { iconName: "tool" as const, color: "#0052CC", bg: "#EFF6FF" };
};

export default function JobNotificationsModal({
  visible,
  onClose,
  onUnreadCountChange,
  initialUnreadCount = 0,
}: JobNotificationsModalProps) {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Job Details & Bid Sub-Modal
  const [selectedNotification, setSelectedNotification] =
    useState<JobNotification | null>(null);
  const [jobDetailModalVisible, setJobDetailModalVisible] =
    useState<boolean>(false);

  // Bid form state
  const [bidPrice, setBidPrice] = useState<string>("");
  const [bidDuration, setBidDuration] = useState<string>("1-2 hours");
  const [bidNote, setBidNote] = useState<string>("");
  const [isBoosted, setIsBoosted] = useState<boolean>(false);
  const [submittingBid, setSubmittingBid] = useState<boolean>(false);
  const [connectsBalance, setConnectsBalance] = useState<number>(5);
  const [showBuyConnects, setShowBuyConnects] = useState<boolean>(false);
  const [alreadyBid, setAlreadyBid] = useState<boolean>(false);

  // Bid cost calculations
  const baseConnects = Number(bidPrice) > 1000 ? 4 : 2;
  const totalRequiredConnects = baseConnects + (isBoosted ? 5 : 0);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);

      const unreadCount = data.filter((n) => !n.read).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount);
      }
    } catch (err: any) {
      console.error("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await apiClient.get("/wallet/balance");
      setConnectsBalance(res.data.connectsBalance ?? 0);
    } catch {
      try {
        const userRes = await apiClient.get("/auth/me");
        const user = userRes.data?.user || userRes.data;
        if (user?.connectsBalance !== undefined) {
          setConnectsBalance(user.connectsBalance);
        }
      } catch (err: any) {
        console.error("Failed to load balance:", err.message);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      fetchNotifications();
      fetchWallet();
    }
  }, [visible, fetchNotifications, fetchWallet]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    fetchWallet();
  };

  const handleMarkAsRead = async (notifId: string) => {
    // Optimistic UI update
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n._id === notifId ? { ...n, read: true } : n,
      );
      const unreadCount = updated.filter((n) => !n.read).length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
      return updated;
    });

    try {
      await notificationsApi.markAsRead(notifId);
    } catch (err: any) {
      console.error("Error marking notification read:", err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadExists = notifications.some((n) => !n.read);
    if (!unreadExists) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (onUnreadCountChange) onUnreadCountChange(0);

    try {
      await notificationsApi.markAllAsRead();
    } catch (err: any) {
      console.error("Error marking all read:", err.message);
    }
  };

  const handleOpenJobDetails = async (notification: JobNotification) => {
    // Mark notification as read when opened
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    setSelectedNotification(notification);
    const initialPrice =
      typeof notification.job === "object" && notification.job?.budget
        ? notification.job.budget.toString()
        : notification.budget
          ? notification.budget.toString()
          : "";

    setBidPrice(initialPrice);
    setBidDuration("1-2 hours");
    setBidNote("");
    setIsBoosted(false);
    setAlreadyBid(false);
    setJobDetailModalVisible(true);

    // Check if provider has already bid on this job
    const jobId =
      typeof notification.job === "object"
        ? notification.job?._id
        : notification.job;

    if (jobId) {
      try {
        const jobRes = await apiClient.get(`/jobs/${jobId}`);
        // If job already assigned or completed
        if (jobRes.data && jobRes.data.status !== "open") {
          // Status not open
        }
      } catch (err) {
        // Silent catch
      }
    }
  };

  const handleSubmitBid = async () => {
    if (!selectedNotification) return;

    const jobId =
      typeof selectedNotification.job === "object"
        ? selectedNotification.job?._id
        : selectedNotification.job;

    if (!jobId) {
      Alert.alert("Error", "Job details are unavailable.");
      return;
    }

    if (!bidPrice.trim() || isNaN(Number(bidPrice)) || Number(bidPrice) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid bid amount in ETB.");
      return;
    }

    if (connectsBalance < totalRequiredConnects) {
      setShowBuyConnects(true);
      return;
    }

    setSubmittingBid(true);
    try {
      await apiClient.post("/bids", {
        jobId,
        price: Number(bidPrice),
        estimatedDuration: bidDuration,
        note: bidNote.trim() || "Ready with all required tools and equipment.",
        isBoosted,
      });

      setConnectsBalance((prev) => Math.max(0, prev - totalRequiredConnects));
      setAlreadyBid(true);
      setJobDetailModalVisible(false);

      Alert.alert(
        "Proposal Sent!",
        `Your bid of ${Number(bidPrice).toLocaleString()} ETB has been submitted to the customer.`,
      );
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        "Could not submit quote. Please try again.";

      if (errMsg.toLowerCase().includes("already submitted")) {
        setAlreadyBid(true);
      }
      Alert.alert("Submission Notice", errMsg);
    } finally {
      setSubmittingBid(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const renderNotificationItem = ({ item }: { item: JobNotification }) => {
    const categoryMeta = getCategoryDetails(item.serviceName);
    const jobData = typeof item.job === "object" ? item.job : null;
    const urgency = item.urgency || jobData?.urgency || "Today";
    const budget = item.budget || jobData?.budget || 0;
    const location =
      item.location ||
      (jobData ? [jobData.subcity, jobData.specificLocation].filter(Boolean).join(" - ") : "Addis Ababa");
    const title = item.jobTitle || jobData?.title || "New Job Request";
    const timeDisplay = formatTimeAgo(item.createdAt, item.timePosted);

    const isEmergency = urgency === "Emergency";
    const isToday = urgency === "Today";

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.read && styles.unreadNotificationCard,
        ]}
        activeOpacity={0.85}
        onPress={() => handleOpenJobDetails(item)}
      >
        {/* Card Header: Category Chip & Urgency / Time */}
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: categoryMeta.bg },
            ]}
          >
            <Feather
              name={categoryMeta.iconName}
              size={moderateScale(12)}
              color={categoryMeta.color}
            />
            <Text
              style={[styles.categoryBadgeText, { color: categoryMeta.color }]}
              numberOfLines={1}
            >
              {item.serviceName || "Service"}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View
              style={[
                styles.urgencyPill,
                isEmergency
                  ? styles.urgencyPillEmergency
                  : isToday
                    ? styles.urgencyPillToday
                    : styles.urgencyPillFlexible,
              ]}
            >
              <Text
                style={[
                  styles.urgencyText,
                  isEmergency
                    ? styles.urgencyTextEmergency
                    : isToday
                      ? styles.urgencyTextToday
                      : styles.urgencyTextFlexible,
                ]}
              >
                {urgency}
              </Text>
            </View>

            {!item.read && <View style={styles.unreadDot} />}
          </View>
        </View>

        {/* Job Title */}
        <Text style={styles.jobTitle} numberOfLines={2}>
          {title}
        </Text>

        {/* Location & Time Posted */}
        <View style={styles.metaRow}>
          <View style={styles.locationItem}>
            <Feather
              name="map-pin"
              size={moderateScale(12)}
              color="#64748B"
              style={{ marginRight: scale(4) }}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <View style={styles.timeItem}>
            <Feather
              name="clock"
              size={moderateScale(11)}
              color="#94A3B8"
              style={{ marginRight: scale(4) }}
            />
            <Text style={styles.timeText}>{timeDisplay}</Text>
          </View>
        </View>

        {/* Budget and Action Button */}
        <View style={styles.cardFooter}>
          <View style={styles.budgetBox}>
            <Text style={styles.budgetLabel}>Budget / Price</Text>
            <Text style={styles.budgetAmount}>
              {budget > 0 ? `${budget.toLocaleString()} ETB` : "Negotiable"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewJobBtn}
            onPress={() => handleOpenJobDetails(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewJobBtnText}>View Job & Bid</Text>
            <Feather
              name="arrow-right"
              size={moderateScale(14)}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Screen Header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <View style={styles.bellIconWrapper}>
              <Feather
                name="bell"
                size={moderateScale(20)}
                color="#0052CC"
              />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.modalTitle}>Job Alerts</Text>
              <Text style={styles.modalSubtitle}>
                {unreadCount === 0
                  ? "All caught up"
                  : `${unreadCount} new matching job${unreadCount > 1 ? "s" : ""}`}
              </Text>
            </View>
          </View>

          <View style={styles.modalHeaderActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllBtn}
                onPress={handleMarkAllAsRead}
                activeOpacity={0.7}
              >
                <Feather
                  name="check-circle"
                  size={moderateScale(14)}
                  color="#0052CC"
                />
                <Text style={styles.markAllText}>Read All</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Feather
                name="x"
                size={moderateScale(20)}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "all" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === "all" && styles.filterPillTextActive,
              ]}
            >
              All Alerts ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === "unread" && styles.filterPillActive,
            ]}
            onPress={() => setFilter("unread")}
          >
            <Text
              style={[
                styles.filterPillText,
                filter === "unread" && styles.filterPillTextActive,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052CC" />
            <Text style={styles.loadingText}>Loading job notifications...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item._id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#0052CC"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather
                    name="bell-off"
                    size={moderateScale(36)}
                    color="#94A3B8"
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === "unread"
                    ? "No Unread Job Alerts"
                    : "No Job Alerts Yet"}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {filter === "unread"
                    ? "You've reviewed all of your job notifications. New alerts will show up here."
                    : "When customers request services matching your trade or skills, you'll receive instant job notifications here."}
                </Text>
              </View>
            }
          />
        )}

        {/* Sub-Modal: Job Details & Quick Bid Submission */}
        {selectedNotification && (
          <Modal
            visible={jobDetailModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setJobDetailModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.detailModalOverlay}
            >
              <View style={styles.detailModalContent}>
                {/* Detail Header */}
                <View style={styles.detailModalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailModalTitle} numberOfLines={1}>
                      Job Details & Quote
                    </Text>
                    <Text style={styles.detailModalSubtitle}>
                      {selectedNotification.serviceName} •{" "}
                      {selectedNotification.urgency}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.detailCloseBtn}
                    onPress={() => setJobDetailModalVisible(false)}
                  >
                    <Feather
                      name="x"
                      size={moderateScale(18)}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.detailScrollContent}
                >
                  {/* Job Overview Card */}
                  <View style={styles.jobOverviewCard}>
                    <Text style={styles.detailJobTitle}>
                      {selectedNotification.jobTitle}
                    </Text>

                    <View style={styles.detailBadgeRow}>
                      <View
                        style={[
                          styles.urgencyPill,
                          selectedNotification.urgency === "Emergency"
                            ? styles.urgencyPillEmergency
                            : styles.urgencyPillToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.urgencyText,
                            selectedNotification.urgency === "Emergency"
                              ? styles.urgencyTextEmergency
                              : styles.urgencyTextToday,
                          ]}
                        >
                          {selectedNotification.urgency} Urgency
                        </Text>
                      </View>

                      <View style={styles.detailBudgetPill}>
                        <Text style={styles.detailBudgetText}>
                          Budget: {selectedNotification.budget.toLocaleString()}{" "}
                          ETB
                        </Text>
                      </View>
                    </View>

                    {/* Location & Time */}
                    <View style={styles.detailMetaBox}>
                      <View style={styles.detailMetaItem}>
                        <Feather
                          name="map-pin"
                          size={moderateScale(14)}
                          color="#0052CC"
                        />
                        <Text style={styles.detailMetaText}>
                          {selectedNotification.location}
                        </Text>
                      </View>

                      <View style={styles.detailMetaItem}>
                        <Feather
                          name="clock"
                          size={moderateScale(14)}
                          color="#64748B"
                        />
                        <Text style={styles.detailMetaText}>
                          Posted{" "}
                          {formatTimeAgo(
                            selectedNotification.createdAt,
                            selectedNotification.timePosted,
                          )}
                        </Text>
                      </View>
                    </View>

                    {/* Customer Info (if available) */}
                    {typeof selectedNotification.job === "object" &&
                      selectedNotification.job?.customer && (
                        <View style={styles.customerBox}>
                          <Feather
                            name="user"
                            size={moderateScale(13)}
                            color="#475569"
                          />
                          <Text style={styles.customerText}>
                            Client:{" "}
                            {selectedNotification.job.customer.fullName ||
                              "Verified Homeowner"}
                          </Text>
                        </View>
                      )}

                    {/* Description */}
                    {typeof selectedNotification.job === "object" &&
                      selectedNotification.job?.description && (
                        <View style={styles.descriptionBox}>
                          <Text style={styles.descriptionLabel}>
                            Task Description:
                          </Text>
                          <Text style={styles.descriptionText}>
                            {selectedNotification.job.description}
                          </Text>
                        </View>
                      )}

                    {/* Job Photos */}
                    {typeof selectedNotification.job === "object" &&
                      selectedNotification.job?.photos &&
                      selectedNotification.job.photos.length > 0 && (
                        <View style={styles.photosSection}>
                          <Text style={styles.descriptionLabel}>
                            Photos Attached:
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.photosScroll}
                          >
                            {selectedNotification.job.photos.map(
                              (photo, idx) => (
                                <Image
                                  key={idx}
                                  source={{
                                    uri: photo.startsWith("http")
                                      ? photo
                                      : `${apiClient.defaults.baseURL?.replace("/api", "")}/${photo}`,
                                  }}
                                  style={styles.jobPhoto}
                                />
                              ),
                            )}
                          </ScrollView>
                        </View>
                      )}
                  </View>

                  {/* Submit Quote Section */}
                  <View style={styles.bidFormSection}>
                    <Text style={styles.bidFormTitle}>Submit Your Quote</Text>

                    {/* Price Input */}
                    <Text style={styles.inputLabel}>
                      Your Proposed Price (ETB) *
                    </Text>
                    <View style={styles.priceInputWrapper}>
                      <Text style={styles.currencyPrefix}>ETB</Text>
                      <TextInput
                        style={styles.priceInput}
                        keyboardType="numeric"
                        placeholder="e.g. 1500"
                        value={bidPrice}
                        onChangeText={setBidPrice}
                      />
                    </View>

                    {/* Duration Selection */}
                    <Text style={styles.inputLabel}>
                      Estimated Completion Time
                    </Text>
                    <View style={styles.durationRow}>
                      {DURATION_OPTIONS.map((dur) => (
                        <TouchableOpacity
                          key={dur}
                          style={[
                            styles.durationPill,
                            bidDuration === dur && styles.durationPillActive,
                          ]}
                          onPress={() => setBidDuration(dur)}
                        >
                          <Text
                            style={[
                              styles.durationPillText,
                              bidDuration === dur &&
                                styles.durationPillTextActive,
                            ]}
                          >
                            {dur}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Note to Customer */}
                    <Text style={styles.inputLabel}>
                      Message to Customer (Optional)
                    </Text>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Specify your tools, warranty, or start time..."
                      multiline
                      numberOfLines={3}
                      value={bidNote}
                      onChangeText={setBidNote}
                    />

                    {/* Boost Proposal Toggle */}
                    <TouchableOpacity
                      style={[
                        styles.boostBox,
                        isBoosted && styles.boostBoxActive,
                      ]}
                      onPress={() => setIsBoosted(!isBoosted)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.boostLeft}>
                        <MaterialCommunityIcons
                          name="rocket-launch-outline"
                          size={moderateScale(20)}
                          color={isBoosted ? "#D97706" : "#64748B"}
                        />
                        <View style={{ marginLeft: scale(10) }}>
                          <Text style={styles.boostTitle}>
                            Boost to Top Rank (+5 Connects)
                          </Text>
                          <Text style={styles.boostSubtitle}>
                            Highlights your quote at the very top of client bids
                          </Text>
                        </View>
                      </View>
                      <Feather
                        name={isBoosted ? "check-circle" : "circle"}
                        size={moderateScale(18)}
                        color={isBoosted ? "#D97706" : "#94A3B8"}
                      />
                    </TouchableOpacity>

                    {/* Connects Cost Summary */}
                    <View style={styles.connectsSummaryBox}>
                      <View style={styles.connectsRow}>
                        <Text style={styles.connectsLabel}>
                          Connects Required:
                        </Text>
                        <Text style={styles.connectsValue}>
                          {totalRequiredConnects} Connects (
                          {baseConnects} base
                          {isBoosted ? " + 5 boost" : ""})
                        </Text>
                      </View>
                      <View style={styles.connectsRow}>
                        <Text style={styles.connectsLabel}>
                          Your Available Balance:
                        </Text>
                        <Text
                          style={[
                            styles.connectsValue,
                            connectsBalance < totalRequiredConnects && {
                              color: "#DC2626",
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {connectsBalance} Connects
                        </Text>
                      </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[
                        styles.submitBidBtn,
                        submittingBid && { opacity: 0.7 },
                      ]}
                      onPress={handleSubmitBid}
                      disabled={submittingBid}
                      activeOpacity={0.8}
                    >
                      {submittingBid ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Feather
                            name="send"
                            size={moderateScale(16)}
                            color="#FFFFFF"
                            style={{ marginRight: scale(8) }}
                          />
                          <Text style={styles.submitBidBtnText}>
                            Submit Bid ({totalRequiredConnects} Connects)
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        )}

        {/* Buy Connects Modal */}
        <BuyConnectsModal
          visible={showBuyConnects}
          onClose={() => setShowBuyConnects(false)}
          currentBalance={connectsBalance}
          onSuccess={(newBalance) => {
            setConnectsBalance(newBalance);
            setShowBuyConnects(false);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(14),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellIconWrapper: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(12),
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#DC2626",
    borderRadius: scale(9),
    paddingHorizontal: scale(5),
    paddingVertical: scale(1),
    minWidth: scale(18),
    alignItems: "center",
  },
  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: scaledFont(10),
    fontWeight: "800",
  },
  modalTitle: {
    fontSize: scaledFont(18),
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  modalHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    backgroundColor: "#EFF6FF",
    gap: scale(4),
  },
  markAllText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#0052CC",
  },
  closeBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    backgroundColor: "#FFFFFF",
    gap: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterPill: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
    backgroundColor: "#F1F5F9",
  },
  filterPillActive: {
    backgroundColor: "#0052CC",
  },
  filterPillText: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#64748B",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scaledFont(14),
    color: "#64748B",
  },
  listContent: {
    padding: scale(16),
    paddingBottom: verticalScale(30),
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(14),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadNotificationCard: {
    borderColor: "#93C5FD",
    backgroundColor: "#F8FAFC",
    borderLeftWidth: scale(4),
    borderLeftColor: "#0052CC",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    gap: scale(5),
    maxWidth: "60%",
  },
  categoryBadgeText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  urgencyPill: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    borderRadius: scale(12),
  },
  urgencyPillEmergency: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  urgencyPillToday: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  urgencyPillFlexible: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  urgencyText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
  },
  urgencyTextEmergency: {
    color: "#DC2626",
  },
  urgencyTextToday: {
    color: "#1D4ED8",
  },
  urgencyTextFlexible: {
    color: "#16A34A",
  },
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#0052CC",
  },
  jobTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: scale(20),
    marginBottom: verticalScale(8),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: scale(10),
  },
  locationText: {
    fontSize: scaledFont(12),
    color: "#64748B",
    flexShrink: 1,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: scaledFont(11),
    color: "#94A3B8",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  budgetBox: {
    justifyContent: "center",
  },
  budgetLabel: {
    fontSize: scaledFont(11),
    color: "#94A3B8",
    fontWeight: "500",
  },
  budgetAmount: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#059669",
    marginTop: scale(1),
  },
  viewJobBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0052CC",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    gap: scale(6),
  },
  viewJobBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(13),
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(60),
    paddingHorizontal: scale(24),
  },
  emptyIconCircle: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: verticalScale(6),
  },
  emptySubtitle: {
    fontSize: scaledFont(13),
    color: "#64748B",
    textAlign: "center",
    lineHeight: scale(18),
  },

  // Detail Modal Styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  detailModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: "90%",
    minHeight: "75%",
  },
  detailModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  detailModalTitle: {
    fontSize: scaledFont(17),
    fontWeight: "700",
    color: "#0F172A",
  },
  detailModalSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  detailCloseBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  detailScrollContent: {
    padding: scale(18),
    paddingBottom: verticalScale(34),
  },
  jobOverviewCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: scale(14),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: verticalScale(18),
  },
  detailJobTitle: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: scale(22),
    marginBottom: verticalScale(10),
  },
  detailBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  detailBudgetPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  detailBudgetText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#059669",
  },
  detailMetaBox: {
    gap: verticalScale(6),
    marginBottom: verticalScale(10),
  },
  detailMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  detailMetaText: {
    fontSize: scaledFont(13),
    color: "#475569",
    fontWeight: "500",
  },
  customerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#FFFFFF",
    padding: scale(10),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: verticalScale(6),
  },
  customerText: {
    fontSize: scaledFont(12),
    color: "#334155",
    fontWeight: "600",
  },
  descriptionBox: {
    marginTop: verticalScale(12),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  descriptionLabel: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#475569",
    marginBottom: verticalScale(4),
  },
  descriptionText: {
    fontSize: scaledFont(13),
    color: "#334155",
    lineHeight: scale(19),
  },
  photosSection: {
    marginTop: verticalScale(12),
  },
  photosScroll: {
    flexDirection: "row",
    marginTop: verticalScale(6),
  },
  jobPhoto: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(8),
    marginRight: scale(8),
    backgroundColor: "#E2E8F0",
  },

  // Bid Form Section
  bidFormSection: {
    marginTop: verticalScale(6),
  },
  bidFormTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: verticalScale(12),
  },
  inputLabel: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#334155",
    marginBottom: verticalScale(6),
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: scale(10),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(14),
  },
  currencyPrefix: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0052CC",
    marginRight: scale(8),
  },
  priceInput: {
    flex: 1,
    height: scale(46),
    fontSize: scaledFont(15),
    color: "#0F172A",
    fontWeight: "600",
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginBottom: verticalScale(14),
  },
  durationPill: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
    borderRadius: scale(8),
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  durationPillActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  durationPillText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#64748B",
  },
  durationPillTextActive: {
    color: "#FFFFFF",
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: scale(10),
    backgroundColor: "#FFFFFF",
    padding: scale(12),
    fontSize: scaledFont(13),
    color: "#0F172A",
    textAlignVertical: "top",
    minHeight: scale(72),
    marginBottom: verticalScale(14),
  },
  boostBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(12),
    borderRadius: scale(10),
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: verticalScale(14),
  },
  boostBoxActive: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  boostLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  boostTitle: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#B45309",
  },
  boostSubtitle: {
    fontSize: scaledFont(11),
    color: "#92400E",
    marginTop: scale(2),
  },
  connectsSummaryBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: scale(10),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: verticalScale(16),
    gap: verticalScale(4),
  },
  connectsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  connectsLabel: {
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  connectsValue: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#0F172A",
  },
  submitBidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0052CC",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBidBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(15),
    fontWeight: "700",
  },
});
