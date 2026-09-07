import React, { useState, useEffect, useMemo } from "react";
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
import UserAvatar from "../../../../components/common/UserAvatar";
import { getAvatarUri } from "../../../../src/utils/avatar";

interface ReviewItem {
  _id: string;
  rating: number;
  comment?: string;
  customer?: {
    _id?: string;
    fullName?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
}

interface ProviderProfile {
  _id: string;
  fullName: string;
  phone?: string;
  profession?: string;
  subcity?: string;
  rating?: number | null;
  reviewCount?: number;
  completedOrders?: number;
  experience?: string;
  skills?: string[];
  avatarUrl?: string;
  isVerified?: boolean;
  reviews?: ReviewItem[];
}

export default function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [provider?.avatarUrl]);

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

  const resolvedAvatarUri = getAvatarUri(provider?.avatarUrl);
  const showImage = Boolean(resolvedAvatarUri) && !imageError;

  const displayedSkills = useMemo(() => {
    if (Array.isArray(provider?.skills) && provider.skills.length > 0) {
      return provider.skills;
    }
    if (provider?.profession) {
      return [provider.profession];
    }
    return [];
  }, [provider?.skills, provider?.profession]);

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
          {showImage && resolvedAvatarUri ? (
            <Image
              source={{ uri: resolvedAvatarUri }}
              style={styles.providerAvatar}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <UserAvatar
              avatarUrl={null}
              name={provider?.fullName || "Technician"}
              size={moderateScale(120)}
            />
          )}
        </View>

        {/* Name, Profession, Location & Direct Call Action */}
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
            <View style={styles.metaRow}>
              <Text style={styles.providerProfession}>
                {provider?.profession || "General Maintenance"}
              </Text>
              {provider?.subcity ? (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <View style={styles.locationContainer}>
                    <Feather
                      name="map-pin"
                      size={moderateScale(12)}
                      color="#64748B"
                    />
                    <Text style={styles.locationText}>{provider.subcity}</Text>
                  </View>
                </>
              ) : null}
            </View>
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
                {provider?.rating != null
                  ? Number(provider.rating).toFixed(1)
                  : "New"}
              </Text>
            </View>
            <Text style={styles.statLabel}>
              {provider?.reviewCount && provider.reviewCount > 0
                ? `Rating (${provider.reviewCount})`
                : "Rating"}
            </Text>
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
                {provider?.completedOrders ?? 0}
              </Text>
            </View>
            <Text style={styles.statLabel}>Orders Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconRow}>
              <Feather name="award" size={moderateScale(14)} color="#0052CC" />
              <Text style={styles.statNumber}>
                {provider?.experience || "General"}
              </Text>
            </View>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* Skills Section */}
        {displayedSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Skills</Text>
            <View style={styles.skillsGrid}>
              {displayedSkills.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Client Reviews Section */}
        {provider?.reviews && provider.reviews.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Client Reviews</Text>
              <Text style={styles.reviewBadge}>
                {provider.reviews.length}{" "}
                {provider.reviews.length === 1 ? "review" : "reviews"}
              </Text>
            </View>
            {provider.reviews.map((rev, index) => (
              <View key={rev._id || index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <UserAvatar
                    avatarUrl={rev.customer?.avatarUrl}
                    name={rev.customer?.fullName || "Customer"}
                    size={moderateScale(38)}
                  />
                  <View style={styles.reviewerMeta}>
                    <Text style={styles.reviewerName}>
                      {rev.customer?.fullName || "Verified Customer"}
                    </Text>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= (rev.rating || 5) ? "star" : "star-outline"}
                          size={moderateScale(12)}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                {rev.comment ? (
                  <Text style={styles.reviewText}>"{rev.comment}"</Text>
                ) : null}
              </View>
            ))}
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
    justifyContent: "center",
    marginTop: scale(12),
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(20),
    overflow: "hidden",
    height: scale(240),
  },
  providerAvatar: {
    width: "100%",
    height: "100%",
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(4),
    flexWrap: "wrap",
    gap: scale(6),
  },
  providerProfession: {
    fontSize: scaledFont(14),
    color: "#64748B",
    fontWeight: "600",
  },
  metaDot: {
    fontSize: scaledFont(13),
    color: "#94A3B8",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
  },
  locationText: {
    fontSize: scaledFont(13),
    color: "#64748B",
    fontWeight: "500",
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(8),
  },
  sectionHeader: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: scale(8),
  },
  reviewBadge: {
    fontSize: scaledFont(11),
    color: "#0052CC",
    fontWeight: "700",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: moderateScale(10),
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    padding: scale(12),
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  reviewerMeta: {
    flex: 1,
  },
  reviewerName: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#0F172A",
  },
  starRow: {
    flexDirection: "row",
    gap: scale(2),
    marginTop: 2,
  },
  reviewText: {
    fontSize: scaledFont(12),
    color: "#475569",
    marginTop: scale(8),
    fontStyle: "italic",
    backgroundColor: "#F8FAFC",
    padding: scale(8),
    borderRadius: moderateScale(8),
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
});
