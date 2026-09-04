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
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CustomerProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of FixLink?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/screen/login"),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("/screen/user/edit-profile")}
        >
          <Feather name="edit-3" size={18} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
            require("../../assets/images/Furniture.jpg")
              }
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBadge}>
              <Feather name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Alex Tefera</Text>
          <Text style={styles.userEmail}>alex.tefera@gmail.com</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Customer Account</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Jobs Posted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>9</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Activity & Orders</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/user/my-requests")}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="clipboard" size={18} color="#0052CC" />
            </View>
            <Text style={styles.menuTitle}>My Service Requests</Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Preferences & Support</Text>

          <View style={styles.menuItem}>
            <View style={[styles.menuIconBox, { backgroundColor: "#F3E8FF" }]}>
              <Feather name="bell" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.menuTitle}>Push Notifications</Text>
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
            <Text style={styles.menuTitle}>Help & Support</Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screen/select-role")}
          >
            <View style={[styles.menuIconBox, { backgroundColor: "#E0F2FE" }]}>
              <Feather name="refresh-cw" size={18} color="#0284C7" />
            </View>
            <Text style={styles.menuTitle}>Switch Role</Text>
            <Feather name="chevron-right" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

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
    marginBottom: 24,
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
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
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
});
