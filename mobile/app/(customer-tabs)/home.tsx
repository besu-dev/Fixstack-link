import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../src/api/client";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import UserAvatar from "../../components/common/UserAvatar";
import { getAvatarUri } from "../../src/utils/avatar";

interface Provider {
  _id: string;
  fullName: string;
  profession: string;
  rating?: number;
  avatarUrl?: string;
  subcity?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  role: string;
}

const CATEGORIES = [
  "All",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Appliance Repair",
  "Solar Installation",
  "HVAC & Air Condition",
];

const POPULAR_SERVICES = [
  {
    id: "1",
    title: "Plumbing",
    icon: "wrench",
    iconFamily: "FontAwesome",
    iconColor: "#F59E0B",
  },
  {
    id: "2",
    title: "Electrical",
    icon: "flash",
    iconFamily: "Ionicons",
    iconColor: "#2563EB",
  },
  {
    id: "3",
    title: "Carpentry",
    icon: "hammer",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#EAB308",
  },
  {
    id: "4",
    title: "Painting",
    icon: "format-paint",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#06B6D4",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Customer");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadHomeData = useCallback(async () => {
    try {
      const userRes = await apiClient.get("/auth/me");
      const user = userRes.data?.user || userRes.data;
      if (user) {
        setUserName(user.fullName?.split(" ")[0] || "Customer");
        if (user.avatarUrl) setUserAvatarUrl(user.avatarUrl);
        await SecureStore.setItemAsync("user_data", JSON.stringify(user));
      }

      const provRes = await apiClient.get("/auth/providers");
      const dbProviders: Provider[] = Array.isArray(provRes.data)
        ? provRes.data
        : provRes.data?.providers || [];

      setProviders(dbProviders);
    } catch (err) {
      console.error("Error loading home screen data:", err);
      const cached = await SecureStore.getItemAsync("user_data");
      if (cached) {
        const user = JSON.parse(cached);
        setUserName(user.fullName?.split(" ")[0] || "Customer");
        if (user.avatarUrl) setUserAvatarUrl(user.avatarUrl);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.fullName?.toLowerCase().includes(q) ||
        p.profession?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "All" ||
        p.profession?.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesQuery && matchesCategory;
    });
  }, [providers, searchQuery, selectedCategory]);

  const hasActiveFilters = selectedCategory !== "All";

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#0052CC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0052CC"]}
          />
        }
      >
        {/* Direct Greeting Header with Support Shortcut & Profile Avatar */}
        <View style={styles.greetingHeader}>
          <View style={styles.greetingTextGroup}>
            <Text style={styles.greetingTitle}>Hi, {userName} 👋</Text>
            <Text style={styles.greetingSubtitle}>
              How can we help you today?
            </Text>
          </View>
          <UserAvatar
            avatarUrl={userAvatarUrl}
            name={userName}
            size={moderateScale(42)}
            onPress={() => router.push("/(customer-tabs)/profile" as any)}
          />
        </View>

        {/* Banner with Embedded Search */}
        <View style={styles.bannerOuterWrapper}>
          <View style={styles.bannerContainer}>
            <View style={styles.bannerTextSection}>
              <Text style={styles.bannerHeadline}>
                Your Home, Our{"\n"}Responsibility
              </Text>
              <Text style={styles.bannerSubhead}>
                Expert professionals.{"\n"}Quality you can trust
              </Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                activeOpacity={0.8}
                onPress={() => router.push("/(customer-tabs)/services" as any)}
              >
                <Text style={styles.bookNowText}>Book Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bannerImageSection}>
              <Image
                source={require("../../assets/images/Furniture.jpg")}
                style={styles.houseGraphic}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Search Bar & Category Filter Toggle */}
          <View style={styles.searchBarContainer}>
            <Feather
              name="search"
              size={moderateScale(18)}
              color="#64748B"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search plumber, electrician, technician..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearSearchBtn}
              >
                <Feather name="x" size={moderateScale(16)} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.filterButton,
                hasActiveFilters && styles.filterButtonActive,
              ]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Feather
                name="sliders"
                size={moderateScale(16)}
                color={hasActiveFilters ? "#FFFFFF" : "#64748B"}
              />
            </TouchableOpacity>
          </View>

          {/* Active Category Filter Tag */}
          {hasActiveFilters && (
            <View style={styles.activeFilterRow}>
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{selectedCategory}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                  <Feather name="x" size={12} color="#0052CC" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                <Text style={styles.resetFilterText}>Reset filter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Popular Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <Link href={"/(customer-tabs)/services" as any} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {POPULAR_SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedCategory.toLowerCase() ===
                  service.title.toLowerCase() && styles.serviceCardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                setSelectedCategory((prev) =>
                  prev.toLowerCase() === service.title.toLowerCase()
                    ? "All"
                    : service.title,
                )
              }
            >
              <View style={styles.serviceIconCircle}>
                {service.iconFamily === "FontAwesome" && (
                  <FontAwesome
                    name={service.icon as any}
                    size={moderateScale(24)}
                    color={service.iconColor}
                  />
                )}
                {service.iconFamily === "Ionicons" && (
                  <Ionicons
                    name={service.icon as any}
                    size={moderateScale(26)}
                    color={service.iconColor}
                  />
                )}
                {service.iconFamily === "MaterialCommunityIcons" && (
                  <MaterialCommunityIcons
                    name={service.icon as any}
                    size={moderateScale(28)}
                    color={service.iconColor}
                  />
                )}
              </View>
              <Text style={styles.serviceCardTitle} numberOfLines={1}>
                {service.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Top Technicians (Filtered Database Results) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Technicians</Text>
          <Link href={"/(customer-tabs)/services" as any} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>
                View all ({filteredProviders.length})
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
        >
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <View key={provider._id} style={styles.providerCard}>
                <View style={styles.providerImageContainer}>
                  <UserAvatar
                    avatarUrl={provider.avatarUrl}
                    name={provider.fullName}
                    size={moderateScale(68)}
                  />
                  {provider.isVerified && (
                    <View style={styles.verifiedTag}>
                      <Ionicons
                        name="shield-checkmark"
                        size={11}
                        color="#16A34A"
                      />
                    </View>
                  )}
                </View>

                <View style={styles.providerDetails}>
                  <Text style={styles.providerName} numberOfLines={1}>
                    {provider.fullName}
                  </Text>
                  <Text style={styles.providerProfession} numberOfLines={1}>
                    {provider.profession || "General Technician"}
                  </Text>

                  <View style={styles.providerFooter}>
                    <View style={styles.ratingBadge}>
                      <FontAwesome
                        name="star"
                        size={moderateScale(12)}
                        color="#F59E0B"
                      />
                      <Text style={styles.ratingText}>
                        {provider.rating ? provider.rating.toFixed(1) : "5.0"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.detailsButton}
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push(
                          `../screen/user/provider-detail/${provider._id}` as any,
                        )
                      }
                    >
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyProviderCard}>
              <Feather name="user-x" size={24} color="#94A3B8" />
              <Text style={styles.emptyProviderText}>
                No registered service providers found for this category.
              </Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>

      {/* Category-Only Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filter by Job Category</Text>

            <View style={styles.filterOptionsGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat && styles.filterChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === cat && styles.filterChipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSelectedCategory("All");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
  scrollContainer: {
    paddingBottom: scale(110),
  },
  greetingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    paddingBottom: scale(14),
  },
  greetingTextGroup: {
    flex: 1,
    paddingRight: scale(10),
  },
  greetingTitle: {
    fontSize: scaledFont(24),
    fontWeight: "800",
    color: "#0052CC",
  },
  greetingSubtitle: {
    fontSize: scaledFont(14),
    color: "#64748B",
    marginTop: scale(4),
    fontWeight: "500",
  },

  bannerOuterWrapper: {
    paddingHorizontal: scale(20),
    marginBottom: scale(24),
  },
  bannerContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: moderateScale(20),
    padding: scale(18),
    paddingBottom: scale(36),
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  bannerTextSection: {
    flex: 1.2,
  },
  bannerHeadline: {
    fontSize: scaledFont(16),
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: scaledFont(22),
  },
  bannerSubhead: {
    fontSize: scaledFont(11),
    color: "#475569",
    marginTop: scale(6),
    lineHeight: scaledFont(15),
  },
  bookNowButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: scale(6),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(16),
    alignSelf: "flex-start",
    marginTop: scale(12),
  },
  bookNowText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: scaledFont(11),
  },
  bannerImageSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  houseGraphic: {
    width: scale(95),
    height: scale(95),
    borderRadius: moderateScale(12),
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    height: scale(48),
    paddingHorizontal: scale(14),
    marginTop: scale(-24),
    marginHorizontal: scale(8),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(13),
    color: "#0F172A",
    height: "100%",
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: scale(4),
  },
  filterButton: {
    padding: scale(6),
    borderRadius: moderateScale(8),
    backgroundColor: "#F1F5F9",
  },
  filterButtonActive: {
    backgroundColor: "#0052CC",
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginTop: scale(10),
    paddingHorizontal: scale(8),
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
  },
  activeFilterText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#0052CC",
  },
  resetFilterText: {
    fontSize: scaledFont(11),
    fontWeight: "600",
    color: "#EF4444",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    marginBottom: scale(12),
  },
  sectionTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#334155",
  },
  viewAllText: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#0052CC",
  },
  horizontalListPadding: {
    paddingLeft: scale(20),
    paddingRight: scale(10),
    marginBottom: scale(20),
  },
  serviceCard: {
    width: scale(96),
    height: scale(100),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: scale(6),
  },
  serviceCardSelected: {
    borderColor: "#0052CC",
    backgroundColor: "#EFF6FF",
  },
  serviceIconCircle: {
    width: moderateScale(46),
    height: moderateScale(46),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(6),
  },
  serviceCardTitle: {
    fontSize: scaledFont(11),
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  providerCard: {
    width: scale(175),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    marginRight: scale(14),
    padding: scale(10),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  providerImageContainer: {
    width: "100%",
    height: scale(125),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  providerImage: {
    width: "100%",
    height: "100%",
  },
  verifiedTag: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 3,
  },
  providerDetails: {
    marginTop: scale(8),
  },
  providerName: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#1E293B",
  },
  providerProfession: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(2),
    marginBottom: scale(8),
  },
  providerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  detailsButton: {
    backgroundColor: "#0052CC",
    paddingVertical: scale(5),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: scaledFont(11),
    fontWeight: "600",
  },
  emptyProviderCard: {
    width: scale(250),
    padding: scale(24),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: scale(8),
  },
  emptyProviderText: {
    fontSize: scaledFont(12),
    color: "#94A3B8",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: scale(20),
    paddingBottom: scale(36),
  },
  modalHandle: {
    width: scale(36),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: scale(14),
  },
  modalTitle: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: scale(16),
  },
  filterOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginBottom: scale(24),
  },
  filterChip: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: moderateScale(16),
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipSelected: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  filterChipText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#475569",
  },
  filterChipTextSelected: {
    color: "#FFFFFF",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  resetBtn: {
    flex: 1,
    height: scale(46),
    borderRadius: moderateScale(10),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#475569",
  },
  applyBtn: {
    flex: 2,
    height: scale(46),
    borderRadius: moderateScale(10),
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
