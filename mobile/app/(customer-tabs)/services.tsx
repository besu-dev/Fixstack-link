import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ImageSourcePropType,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
        image: require("../../assets/images/House-Wiring.jpg"),
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
        image: require("../../assets/images/washing-machine.jpg"),
      },
      {
        id: "a2",
        name: "Refrigerator",
        image: require("../../assets/images/Refrigerator.jpg"),
      },
      {
        id: "a3",
        name: "TV & Satellite",
        image: require("../../assets/images/TV-Satellite.jpg"),
      },
      {
        id: "a4",
        name: "Electric Stove",
        image: require("../../assets/images/Electric-Stove.jpg"),
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
        image: require("../../assets/images/gate.jpg"),
      },
      {
        id: "c2",
        name: "Lock & Key",
        image: require("../../assets/images/Lock-Key.jpg"),
      },
      {
        id: "c3",
        name: "Furniture",
        image: require("../../assets/images/Furniture.jpg"),
      },
      {
        id: "c4",
        name: "Roof Sheet",
        image: require("../../assets/images/Roof-Sheet.jpg"),
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
        image: require("../../assets/images/painting.jpg"),
      },
      {
        id: "h2",
        name: "Tile Repair",
        image: require("../../assets/images/tile.jpg"),
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
        image: require("../../assets/images/Moving-Loading.jpg"),
      },
    ],
  },
];

export default function ServicesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSelect = (name: string) => {
    router.push({
      pathname: "/service-providers",
      params: { category: name },
    } as any);
  };

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather
            name="search"
            size={18}
            color="#94A3B8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search service, e.g. Pump, Wiring..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={18} color="#94A3B8" />
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

              {/* Large Section Work Banner */}
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

              {/* Individual Service Photo Cards */}
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
            <Feather name="search" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No matching services</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with another keyword.
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0052CC",
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 110,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  bannerContainer: {
    marginHorizontal: 20,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
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
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bannerTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0052CC",
  },
  row: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 12,
  },
  card: {
    width: 120,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
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
    bottom: 8,
    left: 8,
    right: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
});
