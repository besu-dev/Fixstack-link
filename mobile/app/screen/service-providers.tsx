import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import apiClient from "../../src/api/client";

interface Provider {
  _id: string;
  fullName: string;
  phone?: string;
  profession: string;
  rating?: number;
  subcity?: string;
  isVerified?: boolean;
  isFeatured: boolean;
}

export default function ServiceProvidersScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProviders = useCallback(async () => {
    try {
      const url = category
        ? `/auth/providers?category=${encodeURIComponent(category)}`
        : `/auth/providers`;
      const res = await apiClient.get(url);
      setProviders(res.data);
    } catch (err: any) {
      console.error(
        "Failed to load providers:",
        err?.response?.data || err.message,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{category || "Specialists"}</Text>
          <Text style={styles.headerSubtitle}>Verified local technicians</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Finding available pros...</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0052CC"]}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, item.isFeatured && styles.cardFeatured]}>
              {/* Featured Badge */}
              {item.isFeatured && (
                <View style={styles.sponsoredBadge}>
                  <Feather name="star" size={10} color="#854D0E" />
                  <Text style={styles.sponsoredBadgeText}>
                    TOP FEATURED PRO
                  </Text>
                </View>
              )}

              <View style={styles.cardMain}>
                <View style={styles.avatar}>
                  <Feather name="tool" size={20} color="#0052CC" />
                </View>

                <View style={styles.infoCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.proName}>{item.fullName}</Text>
                    {item.isVerified && (
                      <Feather name="check-circle" size={13} color="#16A34A" />
                    )}
                  </View>

                  <Text style={styles.professionText}>
                    {item.profession || category}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Feather name="star" size={12} color="#EAB308" />
                      <Text style={styles.metaText}>
                        {item.rating || "5.0"}
                      </Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <View style={styles.metaItem}>
                      <Feather name="map-pin" size={12} color="#64748B" />
                      <Text style={styles.metaText}>
                        {item.subcity || "Addis Ababa"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                {item.phone && (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Linking.openURL(`tel:${item.phone}`)}
                  >
                    <Feather name="phone" size={14} color="#0052CC" />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/(customer-tabs)/post",
                      params: {
                        preferredCategory: item.profession || category,
                      },
                    })
                  }
                >
                  <Text style={styles.bookBtnText}>Request Job</Text>
                  <Feather name="arrow-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="user-x" size={42} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No specialists listed yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to post a public job request in this category.
              </Text>
              <TouchableOpacity
                style={styles.emptyPostBtn}
                onPress={() => router.push("/(customer-tabs)/post")}
              >
                <Text style={styles.emptyPostBtnText}>Post a Job Request</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 13, color: "#64748B" },
  listContent: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardFeatured: {
    borderColor: "#FACC15",
    backgroundColor: "#FFFEFA",
    borderWidth: 1.5,
  },
  sponsoredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF08A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  sponsoredBadgeText: { fontSize: 9, fontWeight: "800", color: "#854D0E" },
  cardMain: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoCol: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  proName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  professionText: {
    fontSize: 13,
    color: "#0052CC",
    fontWeight: "600",
    marginTop: 1,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  dot: { fontSize: 10, color: "#CBD5E1" },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  callBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  callBtnText: { fontSize: 13, fontWeight: "700", color: "#0052CC" },
  bookBtn: {
    flex: 2,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#0052CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bookBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
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
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  emptyPostBtn: {
    marginTop: 16,
    backgroundColor: "#0052CC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyPostBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
