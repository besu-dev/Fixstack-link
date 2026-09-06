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
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../src/api/client";
import { AppAlert } from "../../src/context/AlertContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

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

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      const user = res.data?.user || res.data;
      setProfile(user);
      setIsAvailable(user?.isAvailable ?? true);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));
    } catch {
      const cachedUser = await SecureStore.getItemAsync("user_data");
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        setProfile(parsed);
        setIsAvailable(parsed?.isAvailable ?? true);
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

  const handleNavigateToEdit = () => {
    router.push("../screen/service-provider/edit-profile");
  };

  const handleToggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await apiClient.put("/auth/profile", { isAvailable: value });
      setProfile((prev) => (prev ? { ...prev, isAvailable: value } : prev));
    } catch {
      setIsAvailable(!value);
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

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={handleNavigateToEdit}
          activeOpacity={0.8}
        >
          <Feather name="edit-3" size={moderateScale(16)} color="#0052CC" />
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

        {/* Availability Toggle Box */}
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

        {/* Performance & Connects Card */}
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
            onPress={() => router.push("/screen/buy-connects" as any)}
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/buy-connects" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons
                name="star-outline"
                size={moderateScale(17)}
                color="#D97706"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>7-Day Top Featured Status</Text>
              <Text style={styles.menuSubtitle}>
                {profile?.isFeatured
                  ? "Active Top Placement"
                  : "Upgrade for 150 ETB"}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={moderateScale(17)}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* Account & Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences & Account</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="bell" size={moderateScale(17)} color="#7C3AED" />
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
              <Feather
                name="refresh-cw"
                size={moderateScale(17)}
                color="#0284C7"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Switch to Customer Mode</Text>
              <Text style={styles.menuSubtitle}>
                Request services for your personal home
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
  availabilityBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: scale(15),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(14),
  },
  availabilityInfo: {
    flex: 1,
    marginRight: scale(10),
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  statusDot: {
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(4.5),
  },
  availabilityTitle: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#0F172A",
  },
  availabilitySubtitle: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: 2,
    lineHeight: scale(15),
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    paddingVertical: scale(14),
    paddingHorizontal: scale(8),
    marginBottom: scale(18),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statNumberConnects: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#16A34A",
  },
  statNumber: {
    fontSize: scaledFont(16),
    fontWeight: "800",
    color: "#0052CC",
  },
  statLabel: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: 3,
    fontWeight: "600",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: scale(26),
    backgroundColor: "#E2E8F0",
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
