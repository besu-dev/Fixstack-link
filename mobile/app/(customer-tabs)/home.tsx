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
} from "react-native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

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
    title: "Electric work",
    icon: "flash",
    iconFamily: "Ionicons",
    iconColor: "#2563EB",
  },
  {
    id: "3",
    title: "Solar",
    icon: "solar-power",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#EAB308",
  },
  {
    id: "4",
    title: "Air Condition",
    icon: "air-conditioner",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#06B6D4",
  },
];

const SERVICE_PROVIDERS = [
  {
    id: "1",
    name: "Maskot Kota",
    profession: "Plumber",
    rating: 4.8,
    imageUri:
      "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400",
    bgColor: "#BAE6FD",
  },
  {
    id: "2",
    name: "Shams Jan",
    profession: "Electrician",
    rating: 4.8,
    imageUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    bgColor: "#E9D5FF",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <Image
            source={require("../../assets/images/favicon.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
            <Feather name="phone-call" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Hi, Alex <Text>👋</Text>
          </Text>
          <Text style={styles.greetingSubtitle}>
            How can we help you today?
          </Text>
        </View>

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
                onPress={() => router.push("/services" as any)}
              >
                <Text style={styles.bookNowText}>Book Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bannerImageSection}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/619/619034.png",
                }}
                style={styles.houseGraphic}
                resizeMode="contain"
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.searchBarContainer}
            onPress={() => router.push("/search-results" as any)}
          >
            <Feather
              name="search"
              size={20}
              color="#64748B"
              style={styles.searchIcon}
            />
            <Text
              style={[
                styles.searchInput,
                { color: searchQuery ? "#1E293B" : "#94A3B8" },
              ]}
            >
              {searchQuery || "Search here.."}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.filterButton}
              onPress={() => router.push("/search-filter" as any)}
            >
              <Feather name="sliders" size={18} color="#64748B" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <Link href={"/popular-services" as any} asChild>
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
              style={styles.serviceCard}
              activeOpacity={0.8}
              onPress={() => router.push("/popular-services" as any)}
            >
              <View style={styles.serviceIconCircle}>
                {service.iconFamily === "FontAwesome" && (
                  <FontAwesome
                    name={service.icon as any}
                    size={28}
                    color={service.iconColor}
                  />
                )}
                {service.iconFamily === "Ionicons" && (
                  <Ionicons
                    name={service.icon as any}
                    size={30}
                    color={service.iconColor}
                  />
                )}
                {service.iconFamily === "MaterialCommunityIcons" && (
                  <MaterialCommunityIcons
                    name={service.icon as any}
                    size={32}
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Technicians</Text>
          <Link href={"/service-providers" as any} asChild>
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
          {SERVICE_PROVIDERS.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <View
                style={[
                  styles.providerImageContainer,
                  { backgroundColor: provider.bgColor },
                ]}
              >
                <Image
                  source={{ uri: provider.imageUri }}
                  style={styles.providerImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.providerDetails}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerProfession}>
                  {provider.profession}
                </Text>

                <View style={styles.providerFooter}>
                  <View style={styles.ratingBadge}>
                    <FontAwesome name="star" size={14} color="#0052CC" />
                    <Text style={styles.ratingText}>{provider.rating}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailsButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.detailsButtonText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerLogo: {
    width: 44,
    height: 44,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  greetingContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0052CC",
  },
  greetingSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  bannerOuterWrapper: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bannerContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 18,
    paddingBottom: 36,
    flexDirection: "row",
    position: "relative",
  },
  bannerTextSection: {
    flex: 1.2,
  },
  bannerHeadline: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 22,
  },
  bannerSubhead: {
    fontSize: 12,
    color: "#475569",
    marginTop: 6,
    lineHeight: 16,
  },
  bookNowButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  bookNowText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  bannerImageSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  houseGraphic: {
    width: 105,
    height: 105,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    marginTop: -22,
    marginHorizontal: 8,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },
  filterButton: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0052CC",
  },
  horizontalListPadding: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 20,
  },
  serviceCard: {
    width: 100,
    height: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 6,
  },
  serviceIconCircle: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  serviceCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  providerCard: {
    width: 175,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  providerImageContainer: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
  },
  providerImage: {
    width: "100%",
    height: "100%",
  },
  providerDetails: {
    marginTop: 8,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  providerProfession: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 8,
  },
  providerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0052CC",
  },
  detailsButton: {
    backgroundColor: "#0052CC",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
