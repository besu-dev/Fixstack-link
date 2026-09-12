import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ALL_SERVICE_CATEGORIES,
  ServiceCategoryGroup,
  SubServiceItem,
  findCategoryByQuery,
} from "../../src/data/servicesData";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import { useTheme } from "../../src/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SubServicesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterId, setActiveFilterId] = useState<string>(() => {
    if (params.category && params.category !== "All") {
      const matched = findCategoryByQuery(params.category);
      return matched ? matched.id : "all";
    }
    return "all";
  });

  // Filter chips list
  const filterChips = useMemo(() => {
    return [
      { id: "all", label: "All" },
      ...ALL_SERVICE_CATEGORIES.map((cat) => ({
        id: cat.id,
        label: cat.shortName,
      })),
    ];
  }, []);

  // Filter categories by active chip
  const filteredCategoryGroups = useMemo(() => {
    let groups = ALL_SERVICE_CATEGORIES;

    if (activeFilterId !== "all") {
      groups = groups.filter((g) => g.id === activeFilterId);
    }

    if (!searchQuery.trim()) {
      return groups;
    }

    // Filter sub-services by search query
    const q = searchQuery.toLowerCase().trim();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.categoryTitle.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [activeFilterId, searchQuery]);

  // Total count of matching services
  const totalServicesCount = useMemo(() => {
    return filteredCategoryGroups.reduce((acc, g) => acc + g.items.length, 0);
  }, [filteredCategoryGroups]);

  const handleSubServicePress = (subService: SubServiceItem) => {
    router.push({
      pathname: "/screen/service-providers",
      params: { category: subService.name },
    } as any);
  };

  const renderVisual = (item: SubServiceItem, isFeatured = false) => {
    if (item.image) {
      return (
        <Image
          source={item.image}
          style={isFeatured ? styles.featuredImage : styles.cardImage}
          resizeMode="cover"
        />
      );
    }

    return (
      <View
        style={[
          styles.iconBox,
          { backgroundColor: item.iconBg },
          isFeatured && styles.featuredIconBox,
        ]}
      >
        {item.iconFamily === "Ionicons" && (
          <Ionicons
            name={item.iconName as any}
            size={moderateScale(isFeatured ? 28 : 22)}
            color={item.iconColor}
          />
        )}
        {item.iconFamily === "MaterialCommunityIcons" && (
          <MaterialCommunityIcons
            name={item.iconName as any}
            size={moderateScale(isFeatured ? 28 : 22)}
            color={item.iconColor}
          />
        )}
        {item.iconFamily === "FontAwesome5" && (
          <FontAwesome5
            name={item.iconName as any}
            size={moderateScale(isFeatured ? 24 : 18)}
            color={item.iconColor}
          />
        )}
        {item.iconFamily === "Feather" && (
          <Feather
            name={item.iconName as any}
            size={moderateScale(isFeatured ? 26 : 20)}
            color={item.iconColor}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      {/* Top App Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}> Services</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Certified technicians ready for on-demand booking
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1 }]}>
          <Feather
            name="search"
            size={moderateScale(18)}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search house wiring, boiler, pump..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearSearchBtn}
            >
              <Feather name="x" size={moderateScale(16)} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={[styles.filterBarWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          {filterChips.map((chip) => {
            const isSelected = activeFilterId === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surfaceSecondary },
                  isSelected && { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveFilterId(chip.id);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.textSecondary },
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header or Active Search Indicator */}
      {searchQuery.trim().length > 0 && (
        <View style={[styles.searchResultBar, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.searchResultText, { color: colors.textSecondary }]}>
            Found {totalServicesCount} service{totalServicesCount === 1 ? "" : "s"} for "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredCategoryGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceSecondary }]}>
              <Feather name="search" size={moderateScale(32)} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching services found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try searching for terms like "wiring", "leak", "tiling", or reset your category filter.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={() => {
                setSearchQuery("");
                setActiveFilterId("all");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyResetBtnText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCategoryGroups.map((group) => {
            const isSingleItemCategory = group.items.length === 1;

            return (
              <View key={group.id} style={styles.categorySection}>
                {/* Category Section Header */}
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>{group.title}</Text>
                </View>

                {/* Single Item: Render as a Wide Featured Hero Card */}
                {isSingleItemCategory ? (
                  <View style={styles.featuredCardContainer}>
                    <TouchableOpacity
                      style={[
                        styles.featuredCard,
                        { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      ]}
                      activeOpacity={0.88}
                      onPress={() => handleSubServicePress(group.items[0])}
                    >
                      <View style={styles.featuredVisualWrapper}>
                        {renderVisual(group.items[0], true)}
                      </View>

                      <View style={styles.featuredInfo}>
                        <View style={styles.featuredBadgeRow}>
                          <View
                            style={[
                              styles.popularTag,
                              { backgroundColor: `${group.accentColor}18` },
                            ]}
                          >

                          </View>
                        </View>

                        <Text style={[styles.featuredTitle, { color: colors.text }]}>
                          {group.items[0].name}
                        </Text>
                        <Text style={[styles.featuredDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        </Text>

                        <View style={styles.featuredActionRow}>
                          <Text
                            style={[
                              styles.featuredActionText,
                              { color: group.accentColor },
                            ]}
                          >
                            Find Technicians
                          </Text>
                          <Feather
                            name="arrow-right"
                            size={moderateScale(16)}
                            color={group.accentColor}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Multiple Items: Render in a Generous Smooth Horizontal Carousel */
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollPadding}
                  >
                    {group.items.map((subService) => (
                      <TouchableOpacity
                        key={subService.id}
                        style={[
                          styles.modernCard,
                          { backgroundColor: colors.card, borderColor: colors.cardBorder },
                        ]}
                        activeOpacity={0.82}
                        onPress={() => handleSubServicePress(subService)}
                      >
                        <View style={styles.cardVisualContainer}>
                          {renderVisual(subService)}
                        </View>

                        <View style={styles.cardContent}>
                          <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
                            {subService.name}
                          </Text>

                          <View style={styles.cardFooter}>
                            <Text style={[styles.cardActionHint, { color: colors.primary }]}>Explore</Text>
                            <Feather
                              name="chevron-right"
                              size={moderateScale(14)}
                              color={colors.textMuted}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(18),
    paddingTop: scale(12),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(14),
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: scaledFont(20),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: scaledFont(12),
    fontWeight: "400",
    color: "#64748B",
    marginTop: scale(2),
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(18),
    paddingBottom: scale(12),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(12),
    height: scale(44),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(14),
    color: "#0F172A",
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: scale(4),
  },
  filterBarWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: scale(10),
  },
  filterBarScroll: {
    paddingHorizontal: scale(18),
    gap: scale(8),
  },
  filterChip: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(8),
    borderRadius: moderateScale(20),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  filterChipText: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  searchResultBar: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "#DBEAFE",
  },
  searchResultText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#1E40AF",
  },
  scrollContent: {
    paddingTop: scale(16),
    paddingBottom: scale(40),
  },
  categorySection: {
    marginBottom: scale(26),
  },
  categoryHeader: {
    paddingHorizontal: scale(18),
    marginBottom: scale(10),
  },
  categoryTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  /* Featured Single Item Card (House Wiring) */
  featuredCardContainer: {
    paddingHorizontal: scale(18),
  },
  featuredCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    borderWidth: 1.5,
    padding: scale(12),
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredVisualWrapper: {
    width: scale(96),
    height: scale(96),
    borderRadius: moderateScale(14),
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredIconBox: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(14),
  },
  featuredInfo: {
    flex: 1,
    marginLeft: scale(14),
  },
  featuredBadgeRow: {
    flexDirection: "row",
    marginBottom: scale(4),
  },
  popularTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(8),
  },
  popularTagText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
  },
  featuredTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: scale(3),
  },
  featuredDesc: {
    fontSize: scaledFont(11),
    color: "#64748B",
    lineHeight: scaledFont(15),
    marginBottom: scale(8),
  },
  featuredActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  featuredActionText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
  },

  /* Modern Multiple Items Carousel Card */
  horizontalScrollPadding: {
    paddingHorizontal: scale(18),
    gap: scale(12),
  },
  modernCard: {
    width: scale(132),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: scale(8),
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardVisualContainer: {
    width: "100%",
    height: scale(88),
    borderRadius: moderateScale(12),
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  iconBox: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    paddingTop: scale(8),
    paddingHorizontal: scale(2),
  },
  cardName: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#1E293B",
    minHeight: scaledFont(30),
    lineHeight: scaledFont(15),
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(6),
    paddingTop: scale(4),
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cardActionHint: {
    fontSize: scaledFont(10),
    fontWeight: "600",
    color: "#0052CC",
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(32),
    paddingTop: scale(40),
  },
  emptyIconCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(16),
  },
  emptyTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: scale(6),
  },
  emptySubtitle: {
    fontSize: scaledFont(13),
    color: "#64748B",
    textAlign: "center",
    lineHeight: scaledFont(18),
    marginBottom: scale(20),
  },
  emptyResetBtn: {
    backgroundColor: "#0052CC",
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    borderRadius: moderateScale(12),
  },
  emptyResetBtnText: {
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
