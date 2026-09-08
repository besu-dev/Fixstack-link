import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

interface ServiceItem {
  id: string;
  name: string;
  image: ImageSourcePropType;
  iconName: keyof typeof Ionicons.glyphMap;
}

interface ServiceCategory {
  title: string;
  shortName: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  accentLight: string;
  tagline: string;
  bannerImage: ImageSourcePropType;
  items: ServiceItem[];
}

const CATEGORIES: ServiceCategory[] = [
  {
    title: "Plumbing & Water Systems",
    shortName: "Plumbing",
    iconName: "water",
    accentColor: "#0284C7",
    accentLight: "#E0F2FE",
    tagline: "Leak repairs, pumps, heaters & bathroom fittings",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "p1",
        name: "Tanker Pump",
        iconName: "water-outline",
        image: {
          uri: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "p2",
        name: "Pipe Leak",
        iconName: "build-outline",
        image: {
          uri: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "p3",
        name: "Water Heater",
        iconName: "flame-outline",
        image: {
          uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "p4",
        name: "Bathroom Fit",
        iconName: "construct-outline",
        image: {
          uri: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=400",
        },
      },
    ],
  },
  {
    title: "Electrical & Power",
    shortName: "Electrical",
    iconName: "flash",
    accentColor: "#D97706",
    accentLight: "#FEF3C7",
    tagline: "Certified professional house wiring & electrical solutions",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "e1",
        name: "House Wiring",
        iconName: "flash-outline",
        image: require("../../assets/images/House-Wiring.jpg"),
      },
    ],
  },
  {
    title: "Appliances & Electronics",
    shortName: "Appliances",
    iconName: "tv",
    accentColor: "#7C3AED",
    accentLight: "#F3E8FF",
    tagline: "Diagnostics & repair for home appliances",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "a1",
        name: "Washing Machine",
        iconName: "sync-outline",
        image: require("../../assets/images/washing-machine.jpg"),
      },
      {
        id: "a2",
        name: "Refrigerator",
        iconName: "snow-outline",
        image: require("../../assets/images/Refrigerator.jpg"),
      },
      {
        id: "a3",
        name: "TV & Satellite",
        iconName: "tv-outline",
        image: require("../../assets/images/TV-Satellite.jpg"),
      },
      {
        id: "a4",
        name: "Electric Stove",
        iconName: "restaurant-outline",
        image: require("../../assets/images/Electric-Stove.jpg"),
      },
    ],
  },
  {
    title: "Carpentry & Metalwork",
    shortName: "Carpentry",
    iconName: "hammer",
    accentColor: "#EA580C",
    accentLight: "#FFEDD5",
    tagline: "Gates, security locks, roofs & custom wood fixtures",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "c1",
        name: "Compound Gate",
        iconName: "business-outline",
        image: require("../../assets/images/gate.jpg"),
      },
      {
        id: "c2",
        name: "Lock & Key",
        iconName: "key-outline",
        image: require("../../assets/images/Lock-Key.jpg"),
      },
      {
        id: "c3",
        name: "Furniture",
        iconName: "file-tray-full-outline",
        image: require("../../assets/images/Furniture.jpg"),
      },
      {
        id: "c4",
        name: "Roof Sheet",
        iconName: "home-outline",
        image: require("../../assets/images/Roof-Sheet.jpg"),
      },
    ],
  },
  {
    title: "Finishing & Cleaning",
    shortName: "Finishing",
    iconName: "sparkles",
    accentColor: "#16A34A",
    accentLight: "#DCFCE7",
    tagline: "Interior painting, tiling, deep cleaning & logistics",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "h1",
        name: "Wall Painting",
        iconName: "color-palette-outline",
        image: require("../../assets/images/painting.jpg"),
      },
      {
        id: "h2",
        name: "Tile Repair",
        iconName: "grid-outline",
        image: require("../../assets/images/tile.jpg"),
      },
      {
        id: "h3",
        name: "Deep Cleaning",
        iconName: "sparkles-outline",
        image: {
          uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "h4",
        name: "Moving & Loading",
        iconName: "car-outline",
        image: require("../../assets/images/Moving-Loading.jpg"),
      },
    ],
  },
];

const FILTER_CHIPS = [
  "All",
  "Plumbing",
  "Electrical",
  "Appliances",
  "Carpentry",
  "Finishing",
];

export default function ServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (params?.category) {
      setSearch(params.category);
    }
  }, [params?.category]);

  const handleSelect = (name: string) => {
    router.push({
      pathname: "/screen/service-providers",
      params: { category: name },
    } as any);
  };

  const filteredCategories = useMemo(() => {
    return CATEGORIES.map((cat) => {
      // Check if category matches filter chip
      const matchesFilter =
        selectedFilter === "All" ||
        cat.shortName.toLowerCase() === selectedFilter.toLowerCase();

      if (!matchesFilter) {
        return { ...cat, items: [] };
      }

      // Filter items matching search term
      const matchedItems = cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.title.toLowerCase().includes(search.toLowerCase()) ||
          cat.shortName.toLowerCase().includes(search.toLowerCase()),
      );

      return {
        ...cat,
        items: matchedItems,
      };
    }).filter((cat) => cat.items.length > 0);
  }, [search, selectedFilter]);

  const totalResultsCount = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.topBadgeRow}>
          <View style={styles.topBadge}>
            <Ionicons
              name="shield-checkmark"
              size={moderateScale(12)}
              color="#0052CC"
            />
            <Text style={styles.topBadgeText}>FixLink Pro Directory</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Services Catalog</Text>
        <Text style={styles.headerSub}>
          Select a repair specialty to request instant technician bids
        </Text>
      </View>

      {/* Search Bar & Filter Chips Wrapper */}
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchBar,
            isSearchFocused && styles.searchBarFocused,
          ]}
        >
          <Feather
            name="search"
            size={moderateScale(17)}
            color={isSearchFocused ? "#0052CC" : "#94A3B8"}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search service, e.g. Pump, Wiring, Gate..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={moderateScale(18)}
                color="#94A3B8"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = selectedFilter === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.75}
                onPress={() => setSelectedFilter(chip)}
              >
                {isActive && (
                  <View style={styles.activeDot} />
                )}
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {search.length > 0 && (
          <View style={styles.resultsCounterRow}>
            <Text style={styles.resultsCounterText}>
              Found <Text style={styles.resultsCounterHighlight}>{totalResultsCount}</Text> {totalResultsCount === 1 ? "service" : "services"}
            </Text>
          </View>
        )}

        {filteredCategories.length > 0 ? (
          filteredCategories.map((section) => (
            <View key={section.title} style={styles.section}>
              {/* Category Header Row */}
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleGroup}>
                  <View
                    style={[
                      styles.categoryIconBox,
                      { backgroundColor: section.accentLight },
                    ]}
                  >
                    <Ionicons
                      name={section.iconName}
                      size={moderateScale(17)}
                      color={section.accentColor}
                    />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionSubtitle}>
                      {section.items.length} {section.items.length === 1 ? "specialty" : "specialties"} available
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.exploreBtn}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(section.items[0]?.name || section.title)}
                >
                  <Text style={styles.exploreText}>View All</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={moderateScale(13)}
                    color="#0052CC"
                  />
                </TouchableOpacity>
              </View>

              {/* Work Category Banner Card */}
              <TouchableOpacity
                style={styles.bannerContainer}
                activeOpacity={0.92}
                onPress={() => handleSelect(section.items[0]?.name || section.title)}
              >
                <Image
                  source={section.bannerImage}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay} />

                {/* Top Badge */}
                <View style={styles.bannerTopBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={moderateScale(12)}
                    color="#0052CC"
                  />
                  <Text style={styles.bannerTagText}>Verified Technicians</Text>
                </View>

                {/* Bottom Tagline & Callout */}
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerTitle}>{section.title}</Text>
                  <Text style={styles.bannerSubtitle} numberOfLines={1}>
                    {section.tagline}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Horizontal Scroll Service Cards */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() => handleSelect(item.name)}
                  >
                    {/* Top Image Container */}
                    <View
                      style={[
                        styles.cardImageWrapper,
                        { backgroundColor: section.accentLight },
                      ]}
                    >
                      <Image source={item.image} style={styles.cardImage} />

                      {/* Floating Micro Icon Badge */}
                      <View style={styles.cardIconBadge}>
                        <Ionicons
                          name={item.iconName}
                          size={moderateScale(13)}
                          color={section.accentColor}
                        />
                      </View>
                    </View>

                    {/* Bottom Content Body */}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.cardFooterRow}>
                        <Text style={styles.cardActionText}>Find Pros</Text>
                        <View style={styles.cardArrowCircle}>
                          <Ionicons
                            name="arrow-forward"
                            size={moderateScale(10)}
                            color="#0052CC"
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="search-outline"
                size={moderateScale(36)}
                color="#0052CC"
              />
            </View>
            <Text style={styles.emptyTitle}>No matching services found</Text>
            <Text style={styles.emptySubtitle}>
              {search
                ? `No repair specialties matched "${search}". Try searching for another keyword.`
                : "No services available in this category."}
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.8}
              onPress={() => {
                setSearch("");
                setSelectedFilter("All");
              }}
            >
              <Text style={styles.resetBtnText}>View All Services</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: scale(20),
    paddingTop: scale(6),
    paddingBottom: scale(8),
    backgroundColor: "#FFFFFF",
  },
  topBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(4),
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(12),
  },
  topBadgeText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: scaledFont(22),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  searchWrapper: {
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(13),
    paddingHorizontal: scale(12),
    height: scale(42),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchBarFocused: {
    borderColor: "#0052CC",
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(13),
    color: "#0F172A",
    height: "100%",
  },
  chipsScroll: {
    marginTop: scale(10),
  },
  chipsContainer: {
    gap: scale(8),
    paddingRight: scale(12),
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    paddingHorizontal: scale(13),
    paddingVertical: scale(6),
    borderRadius: moderateScale(20),
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  activeDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontSize: scaledFont(11.5),
    fontWeight: "600",
    color: "#475569",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resultsCounterRow: {
    paddingHorizontal: scale(20),
    marginBottom: scale(10),
  },
  resultsCounterText: {
    fontSize: scaledFont(12),
    color: "#64748B",
    fontWeight: "500",
  },
  resultsCounterHighlight: {
    fontWeight: "700",
    color: "#0052CC",
  },
  scrollContent: {
    paddingTop: scale(14),
    paddingBottom: scale(110),
  },
  section: {
    marginBottom: scale(24),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    marginBottom: scale(10),
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  categoryIconBox: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: scaledFont(11),
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(2),
  },
  exploreText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
  bannerContainer: {
    marginHorizontal: scale(20),
    height: scale(118),
    borderRadius: moderateScale(16),
    overflow: "hidden",
    position: "relative",
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  bannerTopBadge: {
    position: "absolute",
    top: scale(10),
    left: scale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: scale(9),
    paddingVertical: scale(3.5),
    borderRadius: moderateScale(20),
  },
  bannerTagText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
  },
  bannerContent: {
    position: "absolute",
    bottom: scale(10),
    left: scale(12),
    right: scale(12),
  },
  bannerTitle: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: scaledFont(11),
    color: "#E2E8F0",
    marginTop: scale(2),
    fontWeight: "500",
  },
  cardsRow: {
    paddingLeft: scale(20),
    paddingRight: scale(8),
    gap: scale(12),
  },
  card: {
    width: scale(138),
    height: scale(158),
    borderRadius: moderateScale(16),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardImageWrapper: {
    width: "100%",
    height: scale(96),
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardIconBadge: {
    position: "absolute",
    top: scale(7),
    right: scale(7),
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: scale(15),
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(2),
  },
  cardActionText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
  },
  cardArrowCircle: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(50),
    paddingHorizontal: scale(30),
  },
  emptyIconCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(14),
  },
  emptyTitle: {
    fontSize: scaledFont(16),
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(4),
    textAlign: "center",
    lineHeight: scale(18),
  },
  resetBtn: {
    backgroundColor: "#0052CC",
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: moderateScale(10),
    marginTop: scale(18),
  },
  resetBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(12.5),
    fontWeight: "700",
  },
});
