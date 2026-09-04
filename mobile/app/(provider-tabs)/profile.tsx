import React, { useState } from "react";
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
  Alert,
} from "react-native";
import { Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProviderProfileScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of FixLink Provider?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => router.replace("/screen/login"),
        },
      ],
    );
  };

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
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300",
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBadge}>
              <Feather name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>Maskot Kota</Text>
          <Text style={styles.userProfession}>
            Master Plumber & Pump Technician
          </Text>

          {/* Rating & Location Tag */}
          <View style={styles.metaBadgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>4.9 (84 reviews)</Text>
            </View>
            <View style={styles.locationBadge}>
              <Feather name="map-pin" size={12} color="#64748B" />
              <Text style={styles.locationText}>
                Bole & Kirkos, Addis Ababa
              </Text>
            </View>
          </View>

          {/* Verification Badge */}
          <View style={styles.verificationBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
            <Text style={styles.verificationText}>Verified FixLink Pro</Text>
          </View>
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
            onValueChange={setIsAvailable}
            trackColor={{ false: "#CBD5E1", true: "#0052CC" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>128</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Job Success</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18,400</Text>
            <Text style={styles.statLabel}>ETB (This Mo.)</Text>
          </View>
        </View>

        {/* Business & Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Business & Earnings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/provider/wallet" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="wallet-outline" size={18} color="#0052CC" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Payouts & Wallet</Text>
              <Text style={styles.menuSubtitle}>
                Telebirr / CBE / Awash payouts
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push("/screen/provider/service-offerings" as any)
            }
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="tool" size={18} color="#D97706" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My Skills & Rates</Text>
              <Text style={styles.menuSubtitle}>
                Tanker pumps, pipe leakage, rates
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/provider/service-areas" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#F0FDF4" }]}>
              <Feather name="map" size={18} color="#16A34A" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Service Zones (Addis Ababa)</Text>
              <Text style={styles.menuSubtitle}>
                Bole, Kirkos, Yeka, Nifas Silk
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
                Instant notification for nearby requests
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
            onPress={() => router.push("/screen/select-role")}
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/provider/support" as any)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#F1F5F9" }]}>
              <Feather name="help-circle" size={18} color="#475569" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Provider Help Center</Text>
              <Text style={styles.menuSubtitle}>
                Safety, dispute resolution, guidelines
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 110, // Safe clearance above ProviderCustomNavBar
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
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
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
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 24,
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
});
