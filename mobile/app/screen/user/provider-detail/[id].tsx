import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usersApi } from "../../../../src/api";
import { Alert } from "../../../../src/context/AlertContext";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../../../src/utils/responsive";

interface ProviderProfile {
  _id: string;
  fullName: string;
  phone?: string;
  profession?: string;
  rating?: number;
  completedOrders?: number;
  experience?: string;
  skills?: string[];
  bio?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export default function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderDetail = async () => {
      try {
        const data = await usersApi.getProviderProfile(id);
        setProvider(data);
      } catch (err: any) {
        console.error("Failed to load provider profile:", err.message);
        Alert.alert("Error", "Could not load technician details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProviderDetail();
    }
  }, [id]);

  const handleCall = () => {
    if (!provider?.phone) {
      Alert.alert("Unavailable", "Phone number is not provided.");
      return;
    }
    Linking.openURL(`tel:${provider.phone}`).catch(() => {
      Alert.alert("Error", "Unable to open phone dialer.");
    });
  };

  const handleMessage = () => {
    router.push({
      pathname: "/(customer-tabs)/message",
      params: {
        receiverId: provider?._id,
        recipientName: provider?.fullName,
        recipientPhone: provider?.phone,
      },
    });
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

      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={moderateScale(20)} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Technician Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Header Block */}
        <View style={styles.avatarCard}>
          <Image
            source={{
              uri:
                provider?.avatarUrl ||
                "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400",
            }}
            style={styles.providerAvatar}
          />
        </View>

        {/* Name, Profession & Direct Call Action */}
        <View style={styles.nameRow}>
          <View style={styles.nameCol}>
            <View style={styles.titleWithVerify}>
              <Text style={styles.providerName}>
                {provider?.fullName || "Technician"}
              </Text>
              {provider?.isVerified && (
                <Feather
                  name="check-circle"
                  size={moderateScale(16)}
                  color="#16A34A"
                />
              )}
            </View>
            <Text style={styles.providerProfession}>
              {provider?.profession || "General Maintenance"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.phoneCallBtn}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={moderateScale(18)} color="#0052CC" />
          </TouchableOpacity>
        </View>

        {/* Stats Summary Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Ionicons name="star" size={moderateScale(15)} color="#F59E0B" />
              <Text style={styles.statNumber}>
                {provider?.rating ? provider.rating.toFixed(1) : "4.8"}
              </Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Feather
                name="check-circle"
                size={moderateScale(14)}
                color="#16A34A"
              />
              <Text style={styles.statNumber}>
                {provider?.completedOrders ?? 56}
              </Text>
            </View>
            <Text style={styles.statLabel}>Orders Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Feather name="award" size={moderateScale(14)} color="#0052CC" />
              <Text style={styles.statNumber}>
                {provider?.experience || "4 Years"}
              </Text>
            </View>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Skills Section */}
        {provider?.skills && provider.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Skills</Text>
            <View style={styles.skillsGrid}>
              {provider.skills.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Message Action Button */}
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={handleMessage}
          activeOpacity={0.85}
        >
          <Feather
            name="message-square"
            size={moderateScale(16)}
            color="#FFFFFF"
          />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Bio</Text>
          <Text style={styles.bioText}>
            {provider?.bio ||
              `I'm ${provider?.fullName}, a dedicated maintenance professional with a passion for delivering top-notch service to ensure your home runs smoothly.`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: scale(4) },
  headerTitle: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#0F172A",
  },
  placeholder: { width: moderateScale(28) },
  scrollContent: { paddingHorizontal: scale(20), paddingBottom: scale(40) },
  avatarCard: {
    alignItems: "center",
    marginTop: scale(12),
    backgroundColor: "#EFF6FF",
    borderRadius: moderateScale(20),
    overflow: "hidden",
    height: scale(240),
  },
  providerAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(16),
  },
  nameCol: { flex: 1 },
  titleWithVerify: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  providerName: {
    fontSize: scaledFont(22),
    fontWeight: "800",
    color: "#0F172A",
  },
  providerProfession: {
    fontSize: scaledFont(14),
    color: "#64748B",
    marginTop: scale(2),
    fontWeight: "600",
  },
  phoneCallBtn: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    paddingVertical: scale(16),
    paddingHorizontal: scale(10),
    marginTop: scale(18),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  statItem: { alignItems: "center", flex: 1 },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: scale(4) },
  statNumber: { fontSize: scaledFont(15), fontWeight: "800", color: "#0F172A" },
  statLabel: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(3),
    fontWeight: "500",
  },
  statDivider: { width: 1, height: scale(28), backgroundColor: "#E2E8F0" },
  section: { marginTop: scale(20) },
  sectionHeader: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: scale(8),
  },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: scale(8) },
  skillPill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: moderateScale(16),
  },
  skillText: { fontSize: scaledFont(12), fontWeight: "600", color: "#475569" },
  messageBtn: {
    height: scale(50),
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    marginTop: scale(24),
    elevation: 2,
  },
  messageBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(15),
    fontWeight: "700",
  },
  bioText: {
    fontSize: scaledFont(13),
    color: "#475569",
    lineHeight: scale(20),
  },
});
