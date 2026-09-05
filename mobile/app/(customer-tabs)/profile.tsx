import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../src/api/client";
import BuyConnectsModal from "../../components/BuyConnectsModal";

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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const userRes = await apiClient.get("/auth/me");
      setProfile(userRes.data);
      await SecureStore.setItemAsync("user_data", JSON.stringify(userRes.data));

      const jobsRes = await apiClient.get("/jobs/my-requests");
      const jobs = jobsRes.data || [];

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
  }, [fetchProfileData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleConnectsUpdated = (newBalance: number) => {
    setProfile((prev) =>
      prev ? { ...prev, connectsBalance: newBalance } : prev,
    );
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await SecureStore.deleteItemAsync("user_token");
    await SecureStore.deleteItemAsync("user_role");
    await SecureStore.deleteItemAsync("user_data");
    router.replace("/screen/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header with Edit Shortcut */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/screen/user/edit-profile" as any)}
          activeOpacity={0.8}
        >
          <Feather name="edit-3" size={18} color="#0052CC" />
        </TouchableOpacity>
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
            <Image
              source={{
                uri:
                  profile?.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={() => router.push("/screen/user/edit-profile" as any)}
            >
              <Feather name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {profile?.fullName || "Alex Tefera"}
          </Text>
          <Text style={styles.userEmail}>
            {profile?.email || profile?.phone || "No contact info set"}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Customer Account</Text>
          </View>
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
              Use credits for bookings and direct features
            </Text>
          </View>
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => setBuyModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="wallet-outline" size={15} color="#0052CC" />
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
              <Feather name="user" size={18} color="#0052CC" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Edit Profile Information</Text>
              <Text style={styles.menuSubtitle}>
                Name, phone number, and location
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setBuyModalVisible(true)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="card-outline" size={18} color="#D97706" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Billing & Telebirr Top-Up</Text>
              <Text style={styles.menuSubtitle}>
                Recharge your FixLink wallet
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Activity & Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Activity & Orders</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/user/my-requests" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="clipboard" size={18} color="#0052CC" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>My Service Requests</Text>
              <Text style={styles.menuSubtitle}>
                Track open requests & technician quotes
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Preferences & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences & Support</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="bell" size={18} color="#7C3AED" />
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
            onPress={() => router.push("/customer/support" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="help-circle" size={18} color="#16A34A" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Help & Support</Text>
              <Text style={styles.menuSubtitle}>
                FAQs, guides & customer assistance
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace("/(provider-tabs)/jobs" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#E0F2FE" }]}>
              <Feather name="refresh-cw" size={18} color="#0284C7" />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Switch Role (Provider)</Text>
              <Text style={styles.menuSubtitle}>
                Bid on local jobs and earn
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      
      <BuyConnectsModal
        visible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        onSuccess={handleConnectsUpdated}
      />

      {/* Styled Bottom Sheet Modal for Customer Log Out */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLogoutModalVisible(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your FixLink account?
            </Text>

            <TouchableOpacity
              style={styles.modalConfirmBtn}
              onPress={confirmLogout}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setLogoutModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  userCard: {
    alignItems: "center",
    paddingVertical: 18,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E2E8F0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0052CC",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0052CC",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  walletCard: {
    backgroundColor: "#0052CC",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  walletDetails: {
    flex: 1,
    paddingRight: 10,
  },
  walletLabel: {
    color: "#BFDBFE",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  walletAmount: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginVertical: 2,
  },
  walletUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DBEAFE",
  },
  walletSub: {
    color: "#E0E7FF",
    fontSize: 11,
    marginTop: 2,
  },
  rechargeBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rechargeBtnText: {
    color: "#0052CC",
    fontSize: 13,
    fontWeight: "800",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    marginTop: 10,
  },
  logoutText: {
    fontSize: 15,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "center",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalConfirmBtn: {
    width: "100%",
    height: 46,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalCancelBtn: {
    width: "100%",
    height: 46,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
});
