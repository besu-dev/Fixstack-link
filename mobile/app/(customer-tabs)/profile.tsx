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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import apiClient from "../../src/api/client";
import notificationsApi from "../../src/api/notifications";
import BuyConnectsModal from "../../components/BuyConnectsModal";
import CustomerNotificationsModal from "../../components/customer/CustomerNotificationsModal";
import UserAvatar from "../../components/common/UserAvatar";
import { AppAlert } from "../../src/context/AlertContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import { SOCKET_URL } from "../../src/config/api";

interface CustomerData {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  connectsBalance?: number;
}

interface JobStats {
  posted: number;
  completed: number;
  active: number;
}

export default function CustomerProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profile, setProfile] = useState<CustomerData | null>(null);
  const [stats, setStats] = useState<JobStats>({
    posted: 0,
    completed: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadNotificationCount(count);
    } catch {
      // silent fallback
    }
  }, []);

  const fetchProfileData = useCallback(async () => {
    try {
      const userRes = await apiClient.get("/auth/me");
      const user = userRes.data?.user || userRes.data;
      setProfile(user);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));

      const jobsRes = await apiClient.get("/jobs/my-jobs");
      const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];

      const completedCount = jobs.filter(
        (j: any) => j.status === "completed",
      ).length;
      const activeCount = jobs.filter(
        (j: any) => j.status === "open" || j.status === "assigned",
      ).length;

      setStats({
        posted: jobs.length,
        completed: completedCount,
        active: activeCount,
      });
    } catch {
      const cachedUser = await SecureStore.getItemAsync("user_data");
      if (cachedUser) {
        setProfile(JSON.parse(cachedUser));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
    fetchUnreadCount();
  }, [fetchProfileData, fetchUnreadCount]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      fetchUnreadCount();
    }, [fetchProfileData, fetchUnreadCount]),
  );

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

      socket.on("new_proposal_notification", () => {
        setUnreadNotificationCount((prev) => prev + 1);
      });

      socket.on("new_notification", () => {
        setUnreadNotificationCount((prev) => prev + 1);
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
    fetchProfileData();
  };

  const handleConnectsUpdated = (newBalance: number) => {
    setProfile((prev) =>
      prev ? { ...prev, connectsBalance: newBalance } : prev,
    );
  };

  const handleLogout = () => {
    AppAlert.confirm(
      "Sign Out",
      "Are you sure you want to log out of your Bete account?",
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

      {/* Top Header with Notifications & Edit Shortcut */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.notificationHeaderBtn}
            onPress={() => setNotificationsModalVisible(true)}
            activeOpacity={0.8}
          >
            <Feather name="bell" size={moderateScale(18)} color="#0052CC" />
            {unreadNotificationCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/screen/user/edit-profile" as any)}
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
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <UserAvatar
              avatarUrl={profile?.avatarUrl}
              name={profile?.fullName || "Customer"}
              size={moderateScale(84)}
            />
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={() => router.push("/screen/user/edit-profile" as any)}
            >
              <Feather name="camera" size={moderateScale(11)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {profile?.fullName || "Alex Tefera"}
          </Text>
          <Text style={styles.userEmail}>
            {profile?.email || profile?.phone || "No contact info set"}
          </Text>
        </View>

        {/* Live Metrics */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.posted}</Text>
            <Text style={styles.statLabel}>Jobs Posted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Connects / Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletDetails}>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletAmount}>
              {profile?.connectsBalance ?? 0}{" "}
              <Text style={styles.walletUnit}>Connects</Text>
            </Text>
            <Text style={styles.walletSub}>
              Use credits for bookings and urgent requests
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

        {/* Account Details & Edit */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account Settings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/user/edit-profile" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="user" size={moderateScale(17)} color="#0052CC" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Edit Profile Information</Text>
              <Text style={styles.menuSubtitle}>
                Name, phone number, and location
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

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="bell" size={moderateScale(17)} color="#7C3AED" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Push Notifications</Text>
              <Text style={styles.menuSubtitle}>
                Proposal alerts & technician messages
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#CBD5E1", true: "#0052CC" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname: "/screen/help-support",
                params: { role: "customer" },
              } as any)
            }
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#DCFCE7" }]}>
              <Feather
                name="phone-call"
                size={moderateScale(17)}
                color="#16A34A"
              />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Contact Support</Text>
              <Text style={styles.menuSubtitle}>
                Get help from  Bete customer support team
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(17)}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={moderateScale(17)} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BuyConnectsModal
        visible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        onSuccess={handleConnectsUpdated}
        currentBalance={profile?.connectsBalance ?? 0}
      />

      {/* Customer Notifications Modal */}
      <CustomerNotificationsModal
        visible={notificationsModalVisible}
        onClose={() => {
          setNotificationsModalVisible(false);
          fetchUnreadCount();
        }}
        onUnreadCountChange={setUnreadNotificationCount}
        initialUnreadCount={unreadNotificationCount}
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
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(110),
  },
  userCard: {
    alignItems: "center",
    paddingVertical: scale(16),
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
  userEmail: {
    fontSize: scaledFont(13),
    color: "#64748B",
    marginTop: scale(2),
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(16),
    paddingVertical: scale(14),
    marginBottom: scale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#0052CC",
  },
  statLabel: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: scale(24),
    backgroundColor: "#E2E8F0",
  },
  walletCard: {
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(16),
    padding: scale(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(20),
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
    marginBottom: scale(18),
  },
  sectionHeader: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: scale(8),
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
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#1E293B",
  },
  menuSubtitle: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(1),
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    paddingVertical: scale(14),
    borderRadius: moderateScale(12),
    backgroundColor: "#FEF2F2",
    marginTop: scale(8),
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
