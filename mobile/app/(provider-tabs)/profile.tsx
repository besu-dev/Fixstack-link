import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import apiClient from "../../src/api/client";
import notificationsApi from "../../src/api/notifications";
import JobNotificationsModal from "../../components/provider/JobNotificationsModal";
import BuyConnectsModal from "../../components/BuyConnectsModal";
import UserAvatar from "../../components/common/UserAvatar";
import { AppAlert } from "../../src/context/AlertContext";
import { useUnreadMessages } from "../../src/context/UnreadMessagesContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

const SOCKET_URL = __DEV__
  ? Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000"
  : "https://api.fixlink.et";

interface UserProfile {
  _id: string;
  fullName: string;
  phone: string;
  profession: string;
  subcity: string;
  experience: string;
  skills: string[];
  connectsBalance: number;
  rating: number;
  isVerified: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  notificationsEnabled?: boolean;
  avatarUrl?: string;
}

interface ProviderStats {
  active: number;
  completed: number;
}

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { unreadMessageCount } = useUnreadMessages();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProviderStats>({
    active: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  // Notification Modal & Unread Count State
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleConnectsUpdated = (newBalance: number) => {
    setProfile((prev) =>
      prev ? { ...prev, connectsBalance: newBalance } : prev,
    );
  };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent fallback
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      const user = res.data?.user || res.data;
      setProfile(user);
      setNotificationsEnabled(user?.notificationsEnabled ?? true);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));

      // Fetch task metrics
      try {
        const tasksRes = await apiClient.get("/jobs/provider-tasks");
        const tasks = Array.isArray(tasksRes.data)
          ? tasksRes.data
          : tasksRes.data?.tasks || [];

        const activeCount = tasks.filter(
          (t: any) => t.status === "assigned" || t.status === "open",
        ).length;
        const completedCount = tasks.filter(
          (t: any) => t.status === "completed",
        ).length;

        setStats({
          active: activeCount,
          completed: completedCount,
        });
      } catch (taskErr) {
        console.warn("Could not load provider task metrics:", taskErr);
      }
    } catch {
      const cachedUser = await SecureStore.getItemAsync("user_data");
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        setProfile(parsed);
        setNotificationsEnabled(parsed?.notificationsEnabled ?? true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
  }, [fetchProfile, fetchUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  // Real-time socket listener for incoming new job notifications
  useEffect(() => {
    let socket: Socket | null = null;
    if (profile?._id) {
      socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      socket.on("connect", () => {
        socket?.emit("register_user", profile._id);
      });

      socket.on("new_job_notification", () => {
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [profile?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    fetchUnreadCount();
  };

  const handleNavigateToEdit = () => {
    router.push("../screen/service-provider/edit-profile");
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await apiClient.put("/auth/profile", { notificationsEnabled: value });
      setProfile((prev) =>
        prev ? { ...prev, notificationsEnabled: value } : prev,
      );
    } catch {
      setNotificationsEnabled(!value);
    }
  };

  const handleLogout = () => {
    AppAlert.confirm(
      "Sign Out",
      "Are you sure you want to log out of your FixLink technician account?",
      async () => {
        await SecureStore.deleteItemAsync("user_token");
        await SecureStore.deleteItemAsync("user_role");
        await SecureStore.deleteItemAsync("user_data");
        router.replace("/screen/login");
      },
      undefined,
      "Log Out",
      "Cancel",
      true,
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#0052CC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header with Job Notifications Alert 🔔 Button & Badge */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.notificationHeaderBtn}
            onPress={() => setNotificationsModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="bell" size={moderateScale(18)} color="#0052CC" />
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleNavigateToEdit}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={moderateScale(16)} color="#0052CC" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0052CC"]}
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <UserAvatar
              avatarUrl={profile?.avatarUrl}
              name={profile?.fullName || "Provider"}
              size={moderateScale(84)}
            />
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={handleNavigateToEdit}
            >
              <Feather name="camera" size={moderateScale(11)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{profile?.fullName || "Provider"}</Text>
          <Text style={styles.userProfession}>
            {profile?.profession || "General Maintenance"} •{" "}
            {profile?.experience || "1-3 yrs"}
          </Text>

          {/* Rating & Location Tag */}
          <View style={styles.metaBadgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={moderateScale(13)} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {profile?.rating ? profile.rating.toFixed(1) : "5.0"}
              </Text>
            </View>
            <View style={styles.locationBadge}>
              <Feather
                name="map-pin"
                size={moderateScale(11)}
                color="#64748B"
              />
              <Text style={styles.locationText}>
                {profile?.subcity || "Bole"}, Addis Ababa
              </Text>
            </View>
          </View>

          {/* Verification Status Badge */}
          {profile?.isVerified ? (
            <View style={styles.verificationBadge}>
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(13)}
                color="#16A34A"
              />
              <Text style={styles.verificationText}>Verified FixLink Pro</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Ionicons
                name="time-outline"
                size={moderateScale(13)}
                color="#B45309"
              />
              <Text style={styles.pendingText}>
                Verification Pending Review
              </Text>
            </View>
          )}
        </View>

        {/* Live Metrics: Active & Completed Jobs */}
        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(provider-tabs)/tasks" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Active Jobs
            </Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/(provider-tabs)/tasks" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Completed Jobs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Available Connect Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletDetails}>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletAmount}>
              {profile?.connectsBalance ?? 0}{" "}
              <Text style={styles.walletUnit}>Connects</Text>
            </Text>
            <Text style={styles.walletSub}>
              Use credits to submit quotes and bid on jobs
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => setBuyModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons
              name="wallet-outline"
              size={moderateScale(15)}
              color="#0052CC"
            />
            <Text style={styles.rechargeBtnText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Professional Profile Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Professional Setup</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleNavigateToEdit}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Feather
                name="user-check"
                size={moderateScale(17)}
                color="#0052CC"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Edit Professional Details</Text>
              <Text style={styles.menuSubtitle}>
                Trade category, skills, rate & coverage area
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(17)}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* Business & Wallet Management */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Business & Connects</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setBuyModalVisible(true)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons
                name="wallet-outline"
                size={moderateScale(17)}
                color="#0052CC"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Recharge Connects (Telebirr)</Text>
              <Text style={styles.menuSubtitle}>
                Current Balance: {profile?.connectsBalance ?? 0} Connects
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(17)}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* Preferences & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences & Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(provider-tabs)/message" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Feather
                name="message-square"
                size={moderateScale(17)}
                color="#0052CC"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Client Messages</Text>
              <Text style={styles.menuSubtitle}>
                Direct chat with your active customers
              </Text>
            </View>
            {unreadMessageCount > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>
                  {unreadMessageCount > 99 ? "99+" : `${unreadMessageCount} new`}
                </Text>
              </View>
            )}
            <Feather
              name="chevron-right"
              size={moderateScale(17)}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setNotificationsModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="bell" size={moderateScale(17)} color="#7C3AED" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Job Alert Notifications</Text>
              <Text style={styles.menuSubtitle}>
                Instant alerts for matching job requests
              </Text>
            </View>
            {unreadCount > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{unreadCount} new</Text>
              </View>
            )}
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#CBD5E1", true: "#0052CC" }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/customer/support" as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#DCFCE7" }]}>
              <Feather
                name="help-circle"
                size={moderateScale(17)}
                color="#16A34A"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Help & Support</Text>
              <Text style={styles.menuSubtitle}>
                FAQs, guides & customer assistance
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(17)}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={moderateScale(17)} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Job Notifications Modal */}
      <JobNotificationsModal
        visible={notificationsModalVisible}
        onClose={() => {
          setNotificationsModalVisible(false);
          fetchUnreadCount();
        }}
        initialUnreadCount={unreadCount}
        onUnreadCountChange={(cnt) => setUnreadCount(cnt)}
      />

      {/* Buy Connects Modal */}
      <BuyConnectsModal
        visible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        onSuccess={handleConnectsUpdated}
        currentBalance={profile?.connectsBalance ?? 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  notificationHeaderBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#DC2626",
    borderRadius: scale(8),
    minWidth: scale(16),
    height: scale(16),
    paddingHorizontal: scale(3),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: scaledFont(9),
    fontWeight: "800",
  },
  editBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuBadge: {
    backgroundColor: "#DC2626",
    borderRadius: scale(10),
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    marginRight: scale(6),
  },
  menuBadgeText: {
    color: "#FFFFFF",
    fontSize: scaledFont(10),
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: scale(14),
    paddingBottom: scale(110),
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    paddingVertical: scale(18),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(14),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: scale(10),
  },
  avatar: {
    width: moderateScale(84),
    height: moderateScale(84),
    borderRadius: moderateScale(42),
    backgroundColor: "#E2E8F0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: scale(2),
    right: scale(2),
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
  },
  userProfession: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#0052CC",
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: "row",
    gap: scale(12),
    alignItems: "center",
    marginTop: scale(8),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  ratingText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#1E293B",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  locationText: {
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    backgroundColor: "#F0FDF4",
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: moderateScale(14),
    marginTop: scale(10),
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  verificationText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#16A34A",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    backgroundColor: "#FEF3C7",
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: moderateScale(14),
    marginTop: scale(10),
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#B45309",
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(16),
    paddingVertical: scale(14),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statNumber: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0052CC",
  },
  statLabel: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
    fontWeight: "600",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: scale(26),
    backgroundColor: "#E2E8F0",
  },
  walletCard: {
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(16),
    padding: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(18),
    elevation: 2,
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  walletDetails: {
    flex: 1,
    paddingRight: scale(10),
  },
  walletLabel: {
    color: "#BFDBFE",
    fontSize: scaledFont(11),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  walletAmount: {
    color: "#FFFFFF",
    fontSize: scaledFont(24),
    fontWeight: "800",
    marginVertical: scale(2),
  },
  walletUnit: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#DBEAFE",
  },
  walletSub: {
    color: "#E0E7FF",
    fontSize: scaledFont(11),
    marginTop: scale(2),
  },
  rechargeBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(14),
    paddingVertical: scale(9),
    borderRadius: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  rechargeBtnText: {
    color: "#0052CC",
    fontSize: scaledFont(12),
    fontWeight: "800",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(14),
  },
  sectionHeader: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: scale(6),
    marginTop: scale(2),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  menuIconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#1E293B",
  },
  menuSubtitle: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    paddingVertical: scale(14),
    borderRadius: moderateScale(12),
    backgroundColor: "#FEF2F2",
    marginTop: scale(4),
  },
  logoutText: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    paddingBottom: scale(32),
    alignItems: "center",
  },
  modalHandle: {
    width: scale(36),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: "#CBD5E1",
    marginBottom: scale(16),
  },
  modalTitle: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: scale(6),
  },
  modalMessage: {
    fontSize: scaledFont(13),
    color: "#64748B",
    textAlign: "center",
    marginBottom: scale(20),
    lineHeight: scale(18),
  },
  modalConfirmBtn: {
    width: "100%",
    height: scale(46),
    backgroundColor: "#EF4444",
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(10),
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
  modalCancelBtn: {
    width: "100%",
    height: scale(46),
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: "#475569",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
});
