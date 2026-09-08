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
  FontAwesome,
} from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import apiClient from "../../src/api/client";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import UserAvatar from "../../components/common/UserAvatar";
import { SOCKET_URL } from "../../src/config/api";

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

const QUICK_FILTERS = [
  { id: "All", label: "All" },
  { id: "Electrical", label: "Electrical" },
  { id: "Plumbing", label: "Plumbing" },
  { id: "Appliances", label: "Appliances" },
  { id: "Carpentry", label: "Carpentry" },
  { id: "Finishing", label: "Finishing" },
];

const POPULAR_SERVICES = [
  {
    id: "1",
    title: "Electrical & Power",
    shortTitle: "Electrical",
    categoryTitle: "Electrical & Power",
    subtitle: "House wiring, breakers & switches",
    image: require("../../assets/images/categories/cat-electrical.jpg"),
    accentColor: "#D97706",
  },
  {
    id: "2",
    title: "Plumbing & Water",
    shortTitle: "Plumbing",
    categoryTitle: "Plumbing & Water Systems",
    subtitle: "Pipes, leaks, pumps & heaters",
    image: require("../../assets/images/categories/cat-plumbing.jpg"),
    accentColor: "#0284C7",
  },
  {
    id: "3",
    title: "Appliances Repair",
    shortTitle: "Appliances",
    categoryTitle: "Appliances & Electronics",
    subtitle: "Washers, fridges, TV & stoves",
    image: require("../../assets/images/categories/cat-appliances.jpg"),
    accentColor: "#7C3AED",
  },
  {
    id: "4",
    title: "Carpentry & Metal",
    shortTitle: "Carpentry",
    categoryTitle: "Carpentry & Metalwork",
    subtitle: "Furniture, locks, gates & roofs",
    image: require("../../assets/images/categories/cat-carpentry.jpg"),
    accentColor: "#EA580C",
  },
  {
    id: "5",
    title: "Finishing & Cleaning",
    shortTitle: "Finishing",
    categoryTitle: "Finishing & Cleaning",
    subtitle: "Wall paint, tile repair & moving",
    image: require("../../assets/images/categories/cat-finishing.jpg"),
    accentColor: "#16A34A",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Customer");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;
    if (userId) {
      socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
      });

      socket.on("connect", () => {
        socket?.emit("register_user", userId);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  const loadHomeData = useCallback(async () => {
    try {
      const userRes = await apiClient.get("/auth/me");
      const user = userRes.data?.user || userRes.data;
      if (user) {
        setUserName(user.fullName?.split(" ")[0] || "Customer");
        if (user._id) setUserId(user._id);
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
        if (user._id) setUserId(user._id);
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
        {/* Top Header: Greeting */}
        <View style={styles.greetingHeader}>
          <View style={styles.greetingTextGroup}>
            <Text style={styles.greetingTitle}>
              Hi, <Text style={styles.greetingName}>{userName}</Text> 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              What service do you need for your home today?
            </Text>
          </View>
        </View>

        {/* Search Bar with Filter Trigger */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
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
              clearButtonMode="while-editing"
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
              activeOpacity={0.75}
              style={[
                styles.filterButton,
                hasActiveFilters && styles.filterButtonActive,
              ]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Feather
                name="sliders"
                size={moderateScale(16)}
                color={hasActiveFilters ? "#FFFFFF" : "#475569"}
              />
            </TouchableOpacity>
          </View>

          {/* Active Category Filter Tag if active */}
          {hasActiveFilters && (
            <View style={styles.activeFilterRow}>
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>Filtered: {selectedCategory}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                  <Feather name="x" size={13} color="#0052CC" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                <Text style={styles.resetFilterText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Category Filter Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContainer}
        >
          {QUICK_FILTERS.map((chip) => {
            const isActive = selectedCategory.toLowerCase() === chip.id.toLowerCase();
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.quickChip,
                  isActive && styles.quickChipActive,
                ]}
                activeOpacity={0.75}
                onPress={() => setSelectedCategory(chip.id)}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    isActive && styles.quickChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Hero Promotional Banner with Verified Technician */}
        <View style={styles.bannerWrapper}>
          <TouchableOpacity
            style={styles.heroBanner}
            activeOpacity={0.92}
            onPress={() => router.push("/screen/sub-services" as any)}
          >
            <View style={styles.bannerLeft}>
              <View style={styles.bannerTag}>
                <Ionicons name="shield-checkmark" size={moderateScale(12)} color="#0052CC" />
                <Text style={styles.bannerTagText}>VERIFIED HOME CARE</Text>
              </View>
              <Text style={styles.bannerTitle}>
                Your Home, Our{"\n"}Responsibility
              </Text>
              <Text style={styles.bannerDescription}>
                Certified local technicians ready for on-demand repair & maintenance.
              </Text>

              <View style={styles.bannerCtaBtn}>
                <Text style={styles.bannerCtaText}>Explore Services</Text>
                <Feather name="arrow-right" size={moderateScale(14)} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.bannerRight}>
              <Image
                source={require("../../assets/images/hero-technician.jpg")}
                style={styles.bannerTechImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* POPULAR CATEGORIES SECTION (Pure, clean photo cards) */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <Text style={styles.sectionSub}>Find the right trade specialist for your job</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/screen/sub-services",
                params: { category: "All" },
              } as any)
            }
          >
            <View style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View all</Text>
              <Feather name="chevron-right" size={moderateScale(15)} color="#0052CC" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularCardsList}
        >
          {POPULAR_SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.categoryCard}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/screen/sub-services",
                  params: { category: service.categoryTitle },
                } as any)
              }
            >
              {/* Clean Category Photo Visual (No badges, no overlay icons) */}
              <View style={styles.categoryImageContainer}>
                <Image
                  source={service.image}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              </View>

              {/* Category Details */}
              <View style={styles.categoryCardBody}>
                <Text style={styles.categoryCardTitle} numberOfLines={1}>
                  {service.title}
                </Text>
                <Text style={styles.categoryCardSubtitle} numberOfLines={1}>
                  {service.subtitle}
                </Text>

                <View style={styles.categoryCardFooter}>
                  <Text style={[styles.categoryActionText, { color: service.accentColor }]}>
                    Find Pros
                  </Text>
                  <View
                    style={[
                      styles.categoryActionArrow,
                      { backgroundColor: `${service.accentColor}18` },
                    ]}
                  >
                    <Feather
                      name="arrow-right"
                      size={moderateScale(12)}
                      color={service.accentColor}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Top Technicians (Filtered Database Results) */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top Technicians</Text>
            <Text style={styles.sectionSub}>Verified local providers ready to hire</Text>
          </View>
          <Link href={"/screen/service-providers" as any} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>
                  View all ({filteredProviders.length})
                </Text>
                <Feather name="chevron-right" size={moderateScale(15)} color="#0052CC" />
              </View>
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
                        size={moderateScale(12)}
                        color="#16A34A"
                      />
                    </View>
                  )}
                </View>

                <View style={styles.providerDetails}>
                  <Text style={styles.providerName} numberOfLines={1}>
                    {provider.fullName}
                  </Text>
                  <View style={styles.providerProfessionBadge}>
                    <Text style={styles.providerProfession} numberOfLines={1}>
                      {provider.profession || "General Technician"}
                    </Text>
                  </View>

                  {provider.subcity && (
                    <View style={styles.providerLocationRow}>
                      <Ionicons name="location-outline" size={moderateScale(11)} color="#64748B" />
                      <Text style={styles.providerLocationText} numberOfLines={1}>
                        {provider.subcity}
                      </Text>
                    </View>
                  )}

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
              <Feather name="user-x" size={moderateScale(28)} color="#94A3B8" />
              <Text style={styles.emptyProviderText}>
                No service providers found for this selection.
              </Text>
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
              >
                <Text style={styles.emptyResetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
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
                <Text style={styles.applyBtnText}>Apply Filter</Text>
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
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingBottom: scale(115),
  },

  greetingHeader: {
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    paddingBottom: scale(14),
  },
  greetingTextGroup: {
    width: "100%",
  },
  greetingTitle: {
    fontSize: scaledFont(22),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  greetingName: {
    color: "#0052CC",
  },
  greetingSubtitle: {
    fontSize: scaledFont(13),
    color: "#64748B",
    marginTop: scale(3),
  },

  /* Search Section */
  searchSection: {
    paddingHorizontal: scale(20),
    marginBottom: scale(12),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(15),
    height: scale(48),
    paddingHorizontal: scale(14),
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(13.5),
    color: "#0F172A",
    height: "100%",
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: scale(4),
    marginRight: scale(4),
  },
  filterButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#0052CC",
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginTop: scale(8),
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
  },
  activeFilterText: {
    fontSize: scaledFont(11.5),
    fontWeight: "700",
    color: "#0052CC",
  },
  resetFilterText: {
    fontSize: scaledFont(11.5),
    fontWeight: "600",
    color: "#EF4444",
  },

  /* Quick Category Filter Chips */
  quickFiltersContainer: {
    paddingHorizontal: scale(20),
    gap: scale(8),
    paddingBottom: scale(16),
  },
  quickChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: scale(16),
    paddingVertical: scale(7),
    borderRadius: moderateScale(20),
  },
  quickChipActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  quickChipText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#475569",
  },
  quickChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* Hero Promotional Banner */
  bannerWrapper: {
    paddingHorizontal: scale(20),
    marginBottom: scale(22),
  },
  heroBanner: {
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(22),
    padding: scale(18),
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  bannerLeft: {
    flex: 1.2,
    paddingRight: scale(10),
  },
  bannerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(10),
    marginBottom: scale(8),
  },
  bannerTagText: {
    fontSize: scaledFont(9.5),
    fontWeight: "800",
    color: "#0052CC",
    letterSpacing: 0.4,
  },
  bannerTitle: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: scaledFont(23),
    letterSpacing: -0.2,
  },
  bannerDescription: {
    fontSize: scaledFont(11.5),
    color: "#DBEAFE",
    marginTop: scale(5),
    lineHeight: scaledFont(16),
  },
  bannerCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingVertical: scale(7),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(14),
    alignSelf: "flex-start",
    marginTop: scale(12),
  },
  bannerCtaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: scaledFont(12),
  },
  bannerRight: {
    flex: 0.9,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTechImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: moderateScale(16),
  },

  /* Section Headers */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: scale(20),
    marginBottom: scale(12),
  },
  sectionTitle: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(2),
  },
  viewAllText: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#0052CC",
  },

  /* Clean Popular Category Photo Cards */
  popularCardsList: {
    paddingLeft: scale(20),
    paddingRight: scale(8),
    marginBottom: scale(24),
  },
  categoryCard: {
    width: scale(185),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    marginRight: scale(14),
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryImageContainer: {
    width: "100%",
    height: scale(115),
    backgroundColor: "#F1F5F9",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryCardBody: {
    padding: scale(12),
  },
  categoryCardTitle: {
    fontSize: scaledFont(14.5),
    fontWeight: "700",
    color: "#0F172A",
  },
  categoryCardSubtitle: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(2),
    marginBottom: scale(8),
  },
  categoryCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: scale(8),
  },
  categoryActionText: {
    fontSize: scaledFont(11.5),
    fontWeight: "700",
  },
  categoryActionArrow: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    alignItems: "center",
    justifyContent: "center",
  },

  /* Top Technicians List */
  horizontalListPadding: {
    paddingLeft: scale(20),
    paddingRight: scale(8),
    marginBottom: scale(24),
  },
  providerCard: {
    width: scale(180),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    marginRight: scale(14),
    padding: scale(12),
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  providerImageContainer: {
    width: "100%",
    height: scale(110),
    borderRadius: moderateScale(14),
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedTag: {
    position: "absolute",
    top: scale(6),
    right: scale(6),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(10),
    padding: scale(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  providerDetails: {
    marginTop: scale(10),
  },
  providerName: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#0F172A",
  },
  providerProfessionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: moderateScale(6),
    marginTop: scale(4),
    marginBottom: scale(4),
  },
  providerProfession: {
    fontSize: scaledFont(10.5),
    fontWeight: "600",
    color: "#0052CC",
  },
  providerLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
    marginBottom: scale(8),
  },
  providerLocationText: {
    fontSize: scaledFont(10.5),
    color: "#64748B",
  },
  providerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: scale(8),
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  ratingText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0F172A",
  },
  detailsButton: {
    backgroundColor: "#0052CC",
    paddingVertical: scale(5),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(10),
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: scaledFont(11),
    fontWeight: "700",
  },
  emptyProviderCard: {
    width: scale(260),
    padding: scale(24),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: scale(8),
  },
  emptyProviderText: {
    fontSize: scaledFont(12),
    color: "#64748B",
    textAlign: "center",
  },
  emptyResetBtn: {
    backgroundColor: "#0052CC",
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: moderateScale(10),
    marginTop: scale(4),
  },
  emptyResetBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(11.5),
    fontWeight: "700",
  },

  /* Filter Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
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
    width: scale(40),
    height: scale(4),
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: scale(16),
  },
  modalTitle: {
    fontSize: scaledFont(17),
    fontWeight: "700",
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
    borderRadius: moderateScale(20),
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipSelected: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  filterChipText: {
    fontSize: scaledFont(12.5),
    fontWeight: "600",
    color: "#475569",
  },
  filterChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  resetBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: scaledFont(13.5),
    fontWeight: "600",
    color: "#64748B",
  },
  applyBtn: {
    flex: 2,
    backgroundColor: "#0052CC",
    paddingVertical: scale(12),
    borderRadius: moderateScale(14),
    alignItems: "center",
  },
  applyBtnText: {
    fontSize: scaledFont(13.5),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
