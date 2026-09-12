import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usersApi } from "../../src/api";
import { SERVER_BASE_URL } from "../../src/config/api";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import UserAvatar from "../../components/common/UserAvatar";
import { useTheme } from "../../src/context/ThemeContext";

interface Provider {
  _id: string;
  fullName: string;
  phone?: string;
  profession: string;
  skills?: string[];
  experience?: string;
  rating?: number;
  subcity?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isAvailable?: boolean;
  isFeatured: boolean;
}

export default function ServiceProvidersScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { category } = useLocalSearchParams<{ category?: string }>();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProviders = useCallback(async () => {
    try {
      const data = await usersApi.getProvidersList({ category });
      setProviders(data);
    } catch (err: any) {
      console.error(
        "Failed to load providers:",
        err?.response?.data || err.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProviders();
  };

  // Resolve avatar URL with fallback
  const getAvatarUri = (avatarUrl?: string) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith("http")) return avatarUrl;
    const normalized = avatarUrl.replace(/\\/g, "/");
    return `${SERVER_BASE_URL}/${normalized.startsWith("/") ? normalized.slice(1) : normalized}`;
  };

  // Filter providers by local search query (name, profession, or subcity)
  const filteredProviders = providers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      (p.profession && p.profession.toLowerCase().includes(q)) ||
      (p.subcity && p.subcity.toLowerCase().includes(q)) ||
      (p.skills && p.skills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      {/* Navigation Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {category || "Service Specialists"}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Verified technicians available for hire
          </Text>
        </View>
      </View>

      {/* Search within this specialty */}
      <View style={[styles.searchWrapper, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1 }]}>
          <Feather
            name="search"
            size={moderateScale(16)}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Filter ${category || "technicians"} by name or subcity...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={moderateScale(16)} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding available {category || "specialists"}...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const isOnline = item.isAvailable !== false;
            const avatarUri = getAvatarUri(item.avatarUrl);

            return (
              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  item.isFeatured && styles.cardFeatured,
                ]}
              >
                {/* Top Badges Row: Featured & Availability */}
                <View style={styles.topBadgesRow}>
                  {item.isFeatured ? (
                    <View style={styles.sponsoredBadge}>
                      <FontAwesome
                        name="star"
                        size={moderateScale(10)}
                        color="#854D0E"
                      />
                      <Text style={styles.sponsoredBadgeText}>
                        TOP FEATURED PRO
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {/* Availability Badge */}
                  <View
                    style={[
                      styles.availabilityBadge,
                      isOnline
                        ? styles.availabilityOnline
                        : styles.availabilityOffline,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isOnline
                          ? styles.statusDotOnline
                          : styles.statusDotOffline,
                      ]}
                    />
                    <Text
                      style={[
                        styles.availabilityText,
                        isOnline
                          ? styles.availabilityTextOnline
                          : styles.availabilityTextOffline,
                      ]}
                    >
                      {isOnline ? "Available Now" : "Unavailable"}
                    </Text>
                  </View>
                </View>

                {/* Main Card Section */}
                <View style={styles.cardMain}>
                  {/* Profile Photo */}
                  <View style={styles.avatarContainer}>
                    <UserAvatar
                      avatarUrl={item.avatarUrl}
                      name={item.fullName}
                      size={moderateScale(56)}
                    />
                  </View>

                  {/* Info Column */}
                  <View style={styles.infoCol}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.proName, { color: colors.text }]} numberOfLines={1}>
                        {item.fullName}
                      </Text>
                      {item.isVerified && (
                        <Feather
                          name="check-circle"
                          size={moderateScale(13)}
                          color="#16A34A"
                        />
                      )}
                    </View>

                    {/* Service/Profession */}
                    <Text style={[styles.professionText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.profession || category || "Technician"}
                    </Text>

                    {/* Meta Row: Rating, Experience, Location */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <FontAwesome
                          name="star"
                          size={moderateScale(12)}
                          color="#F59E0B"
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {item.rating ? Number(item.rating).toFixed(1) : "5.0"}
                        </Text>
                      </View>
                      <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
                      <View style={styles.metaItem}>
                        <Feather
                          name="briefcase"
                          size={moderateScale(11)}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          {item.experience || "1-3 yrs"}
                        </Text>
                      </View>
                      <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
                      <View style={styles.metaItem}>
                        <Feather
                          name="map-pin"
                          size={moderateScale(11)}
                          color={colors.textSecondary}
                        />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {item.subcity || "Addis Ababa"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Sub-skills chips (if available) */}
                {item.skills && item.skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    {item.skills.slice(0, 3).map((skill, idx) => (
                      <View key={idx} style={[styles.skillPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.skillPillText, { color: colors.textSecondary }]}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons Row */}
                <View style={styles.cardActions}>
                  {/* Quick Call Button */}
                  {item.phone ? (
                    <TouchableOpacity
                      style={[
                        styles.callBtn,
                        { backgroundColor: isDark ? "rgba(37, 99, 235, 0.2)" : "#EFF6FF" },
                      ]}
                      onPress={() => Linking.openURL(`tel:${item.phone}`)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Feather
                        name="phone"
                        size={moderateScale(15)}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  ) : null}

                  {/* View Profile Button */}
                  <TouchableOpacity
                    style={[
                      styles.profileBtn,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.cardBorder },
                    ]}
                    onPress={() =>
                      router.push(
                        `/screen/user/provider-detail/${item._id}` as any
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="user"
                      size={moderateScale(13)}
                      color={colors.primary}
                    />
                    <Text style={[styles.profileBtnText, { color: colors.primary }]}>View Profile</Text>
                  </TouchableOpacity>

                  {/* Request Service Button */}
                  <TouchableOpacity
                    style={styles.requestBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/(customer-tabs)/post",
                        params: {
                          preferredCategory: item.profession || category,
                          preferredProviderId: item._id,
                          preferredProviderName: item.fullName,
                          serviceTitle: category,
                        },
                      } as any)
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={styles.requestBtnText}>Request Service</Text>
                    <Feather
                      name="arrow-right"
                      size={moderateScale(13)}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="user-x"
                size={moderateScale(42)}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No {category || "specialists"} found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery
                  ? "Try searching for a different subcity or name."
                  : `No certified technicians are currently registered under "${category}". You can still post a job request!`}
              </Text>
              <TouchableOpacity
                style={styles.emptyPostBtn}
                onPress={() =>
                  router.push({
                    pathname: "/(customer-tabs)/post",
                    params: { preferredCategory: category },
                  } as any)
                }
              >
                <Text style={styles.emptyPostBtnText}>Post a Job Request</Text>
                <Feather
                  name="arrow-right"
                  size={moderateScale(14)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    padding: scale(4),
    marginRight: scale(10),
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },

  searchWrapper: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    height: scale(38),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(12),
    color: "#0F172A",
    padding: 0,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(60),
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: scaledFont(13),
    color: "#64748B",
  },
  listContent: {
    padding: scale(16),
    paddingBottom: scale(60),
  },

  // Card styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardFeatured: {
    borderColor: "#FACC15",
    backgroundColor: "#FFFEFA",
    borderWidth: 1.5,
  },

  topBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },
  sponsoredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#FEF08A",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(4),
  },
  sponsoredBadgeText: {
    fontSize: scaledFont(9),
    fontWeight: "800",
    color: "#854D0E",
  },

  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  availabilityOnline: {
    backgroundColor: "#DCFCE7",
  },
  availabilityOffline: {
    backgroundColor: "#F1F5F9",
  },
  statusDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
  statusDotOnline: {
    backgroundColor: "#16A34A",
  },
  statusDotOffline: {
    backgroundColor: "#94A3B8",
  },
  availabilityText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
  },
  availabilityTextOnline: {
    color: "#15803D",
  },
  availabilityTextOffline: {
    color: "#64748B",
  },

  cardMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: scale(12),
  },
  avatarImage: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#E2E8F0",
  },
  avatarFallback: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
  },
  proName: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
  },
  professionText: {
    fontSize: scaledFont(12),
    color: "#0052CC",
    fontWeight: "700",
    marginTop: scale(2),
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginTop: scale(4),
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
  },
  metaText: {
    fontSize: scaledFont(11),
    color: "#64748B",
    fontWeight: "600",
  },
  dot: {
    fontSize: scaledFont(10),
    color: "#CBD5E1",
  },

  skillsRow: {
    flexDirection: "row",
    gap: scale(6),
    marginTop: scale(10),
    flexWrap: "wrap",
  },
  skillPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: moderateScale(6),
  },
  skillPillText: {
    fontSize: scaledFont(10),
    color: "#475569",
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: scale(12),
    alignItems: "center",
  },
  callBtn: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtn: {
    flex: 1,
    height: moderateScale(38),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(5),
  },
  profileBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
  requestBtn: {
    flex: 1.3,
    height: moderateScale(38),
    borderRadius: moderateScale(8),
    backgroundColor: "#0052CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(5),
  },
  requestBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scale(60),
    paddingHorizontal: scale(20),
  },
  emptyTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#334155",
    marginTop: scale(12),
  },
  emptySubtitle: {
    fontSize: scaledFont(12),
    color: "#94A3B8",
    textAlign: "center",
    marginTop: scale(4),
    lineHeight: scale(17),
  },
  emptyPostBtn: {
    marginTop: scale(16),
    backgroundColor: "#0052CC",
    paddingHorizontal: scale(18),
    paddingVertical: scale(10),
    borderRadius: moderateScale(8),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  emptyPostBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(13),
    fontWeight: "700",
  },
});
