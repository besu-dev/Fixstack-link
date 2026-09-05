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
  avatarUrl?: string;
}

export default function ProviderProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      setProfile(res.data);
      setIsAvailable(res.data.isAvailable ?? true);
      await SecureStore.setItemAsync("user_data", JSON.stringify(res.data));
    } catch {
      const cached = await SecureStore.getItemAsync("user_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        setIsAvailable(parsed.isAvailable ?? true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleToggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await apiClient.put("/auth/availability", { isAvailable: value });
    } catch {
      setIsAvailable(!value);
    }
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/screen/provider/edit-profile" as any)}
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  profile?.avatarUrl ||
                  "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.8}>
              <Feather name="camera" size={12} color="#FFFFFF" />
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
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {profile?.rating ? profile.rating.toFixed(1) : "5.0"}
              </Text>
            </View>
            <View style={styles.locationBadge}>
              <Feather name="map-pin" size={12} color="#64748B" />
              <Text style={styles.locationText}>
                {profile?.subcity || "Bole"}, Addis Ababa
              </Text>
            </View>
          </View>

          {/* Verification Badge */}
          {profile?.isVerified ? (
            <View style={styles.verificationBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
              <Text style={styles.verificationText}>Verified FixLink Pro</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={14} color="#B45309" />
              <Text style={styles.pendingText}>
                Verification Pending Review
              </Text>
            </View>
          )}
        </View>

        {/* Availability Toggle */}
        <View style={styles.availabilityBox}>
          <View style={styles.availabilityInfo}>
            <View style={styles.statusDotRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isAvailable ? "#16A34A" : "#94A3B8" },
                ]}
              />
              <Text style={styles.availabilityTitle}>
                {isAvailable ? "Available for New Jobs" : "Offline / On Break"}
              </Text>
            </View>
            <Text style={styles.availabilitySubtitle}>
              {isAvailable
                ? "Your profile is active on the map and customer search"
                : "Turn on to receive emergency and scheduled bids"}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: "#CBD5E1", true: "#0052CC" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Performance & Connects Row */}
        <View style={styles.statsCard}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push("/screen/buy-connects" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumberConnects}>
              {profile?.connectsBalance ?? 5}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Connects
            </Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Success
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {profile?.isFeatured ? "Featured" : "Standard"}
            </Text>
            <Text style={styles.statLabel} numberOfLines={1}>
              Account Tier
            </Text>
          </View>
        </View>

        {/* Business & Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Business & Connects</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/buy-connects" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="wallet-outline" size={18} color="#0052CC" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Recharge Connects (Telebirr)</Text>
              <Text style={styles.menuSubtitle}>
                Current Balance: {profile?.connectsBalance ?? 0} Connects
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/buy-connects" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="star-outline" size={18} color="#D97706" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>7-Day Top Featured Status</Text>
              <Text style={styles.menuSubtitle}>
                {profile?.isFeatured
                  ? "Active Top Placement"
                  : "Upgrade for 150 ETB"}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Account & Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences & Account</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="bell" size={18} color="#7C3AED" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Job Alert Notifications</Text>
              <Text style={styles.menuSubtitle}>
                Instant alerts for nearby job postings
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
            onPress={() => router.replace("/(customer-tabs)/services" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#E0F2FE" }]}>
              <Feather name="refresh-cw" size={18} color="#0284C7" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Switch to Customer Mode</Text>
              <Text style={styles.menuSubtitle}>
                Request services for your personal home
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Styled Bottom Sheet Modal for Log Out */}
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
              Are you sure you want to log out your account?
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
    backgroundColor: "#F8FAFC",
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
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
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
    paddingTop: 14,
    paddingBottom: 110,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
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
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },
  userProfession: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0052CC",
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#64748B",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  verificationText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },
  availabilityBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  availabilityInfo: {
    flex: 1,
    marginRight: 10,
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  availabilitySubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statNumberConnects: {
    fontSize: 17,
    fontWeight: "800",
    color: "#16A34A",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0052CC",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "600",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
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
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },

  // Modal styling
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
