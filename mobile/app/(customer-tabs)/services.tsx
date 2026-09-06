import React, { useState, useEffect } from "react";
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
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

interface ServiceItem {
  id: string;
  name: string;
  image: ImageSourcePropType;
}

interface ServiceCategory {
  title: string;
  bannerImage: ImageSourcePropType;
  items: ServiceItem[];
}

const CATEGORIES: ServiceCategory[] = [
  {
    title: "Plumbing & Water Systems",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "p1",
        name: "Tanker Pump",
        image: {
          uri: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "p2",
        name: "Pipe Leak",
        image: {
          uri: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "p3",
        name: "Water Heater",
        image: {
          uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "p4",
        name: "Bathroom Fit",
        image: {
          uri: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=400",
        },
      },
    ],
  },
  {
    title: "Electrical & Power",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "e1",
        name: "House Wiring",
        image: {
          uri: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "e2",
        name: "Generator",
        image: {
          uri: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "e3",
        name: "Solar System",
        image: {
          uri: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "e4",
        name: "Breaker Fix",
        image: {
          uri: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400",
        },
      },
    ],
  },
  {
    title: "Appliances & Electronics",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "a1",
        name: "Washing Machine",
        image: {
          uri: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "a2",
        name: "Refrigerator",
        image: {
          uri: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "a3",
        name: "TV & Satellite",
        image: {
          uri: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "a4",
        name: "Electric Stove",
        image: {
          uri: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=400",
        },
      },
    ],
  },
  {
    title: "Carpentry & Metalwork",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "c1",
        name: "Compound Gate",
        image: {
          uri: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "c2",
        name: "Lock & Key",
        image: {
          uri: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "c3",
        name: "Furniture",
        image: {
          uri: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "c4",
        name: "Roof Sheet",
        image: {
          uri: "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&q=80&w=400",
        },
      },
    ],
  },
  {
    title: "Finishing & Cleaning",
    bannerImage: {
      uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800",
    },
    items: [
      {
        id: "h1",
        name: "Wall Painting",
        image: {
          uri: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "h2",
        name: "Tile Repair",
        image: {
          uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "h3",
        name: "Deep Cleaning",
        image: {
          uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400",
        },
      },
      {
        id: "h4",
        name: "Moving & Loading",
        image: {
          uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400",
        },
      },
    ],
  },
];

export default function ServicesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const [search, setSearch] = useState("");

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

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.title.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services Catalog</Text>
        <Text style={styles.headerSub}>
          Select a repair specialty to request bids
        </Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={moderateScale(18)}
            color="#94A3B8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search service, e.g. Pump, Wiring, Gate..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={moderateScale(18)} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.length > 0 ? (
          filteredCategories.map((section) => (
            <View key={section.title} style={styles.section}>
              {/* Category Title */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              {/* Work Category Banner */}
              <View style={styles.bannerContainer}>
                <Image
                  source={section.bannerImage}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerTag}>
                  <Text style={styles.bannerTagText}>Verified Technicians</Text>
                </View>
              </View>

              {/* Horizontal Scroll Service Cards */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
              >
                {section.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() => handleSelect(item.name)}
                  >
                    <Image source={item.image} style={styles.cardImage} />
                    <View style={styles.cardImageOverlay} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={moderateScale(38)} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No matching services found</Text>
            <Text style={styles.emptySubtitle}>
              {`Try searching for another keyword like "Pipe", "Solar", or "Gate"`}
            </Text>
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
    paddingTop: scale(4),
    paddingBottom: scale(6),
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: scaledFont(22),
    fontWeight: "800",
    color: "#0052CC",
  },
  headerSub: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  searchWrapper: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(8),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    height: scale(42),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(13),
    color: "#0F172A",
  },
  scrollContent: {
    paddingTop: scale(14),
    paddingBottom: scale(110),
  },
  section: {
    marginBottom: scale(22),
  },
  sectionHeaderRow: {
    paddingHorizontal: scale(20),
    marginBottom: scale(8),
  },
  sectionTitle: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#1E293B",
  },
  bannerContainer: {
    marginHorizontal: scale(20),
    height: scale(115),
    borderRadius: moderateScale(14),
    overflow: "hidden",
    position: "relative",
    marginBottom: scale(12),
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  bannerTag: {
    position: "absolute",
    bottom: scale(10),
    left: scale(10),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: moderateScale(20),
  },
  bannerTagText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
  },
  row: {
    paddingLeft: scale(20),
    paddingRight: scale(8),
    gap: scale(12),
  },
  card: {
    width: scale(115),
    height: scale(115),
    borderRadius: moderateScale(14),
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  cardContent: {
    position: "absolute",
    bottom: scale(8),
    left: scale(8),
    right: scale(8),
  },
  cardTitle: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(50),
    paddingHorizontal: scale(20),
  },
  emptyTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#334155",
    marginTop: scale(12),
  },
  emptySubtitle: {
    fontSize: scaledFont(12),
    color: "#94A3B8",
    marginTop: scale(4),
    textAlign: "center",
  },
});
