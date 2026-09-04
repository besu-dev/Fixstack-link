import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type RequestStatus = "Pending" | "Ongoing" | "Completed" | "Cancelled";

interface ServiceRequest {
  id: string;
  title: string;
  category: string;
  date: string;
  priceEstimate: string;
  status: RequestStatus;
  provider?: {
    name: string;
    avatarUri: string;
  };
}

const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "REQ-101",
    title: "Leaking Kitchen Sink Pipe",
    category: "Plumbing",
    date: "Sep 2, 2026",
    priceEstimate: "600 - 850 ETB",
    status: "Ongoing",
    provider: {
      name: "Maskot Kota",
      avatarUri:
        "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400",
    },
  },
  {
    id: "REQ-102",
    title: "Circuit Breaker Tripping",
    category: "Electrical",
    date: "Sep 3, 2026",
    priceEstimate: "500 - 1,000 ETB",
    status: "Pending",
  },
  {
    id: "REQ-103",
    title: "Solar Inverter Maintenance",
    category: "Solar",
    date: "Aug 26, 2026",
    priceEstimate: "1,500 ETB",
    status: "Completed",
    provider: {
      name: "Ethan Lita",
      avatarUri:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    },
  },
  {
    id: "REQ-104",
    title: "Door Lock Mechanism Jammed",
    category: "Locksmith",
    date: "Aug 15, 2026",
    priceEstimate: "400 ETB",
    status: "Cancelled",
  },
];

const STATUS_TABS: ("All" | RequestStatus)[] = [
  "All",
  "Pending",
  "Ongoing",
  "Completed",
  "Cancelled",
];

export default function MyServiceRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | RequestStatus>("All");

  const filteredRequests =
    activeTab === "All"
      ? MOCK_REQUESTS
      : MOCK_REQUESTS.filter((req) => req.status === activeTab);

  const getStatusBadgeStyle = (status: RequestStatus) => {
    switch (status) {
      case "Ongoing":
        return { bg: "#EFF6FF", text: "#0052CC", border: "#BFDBFE" };
      case "Pending":
        return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" };
      case "Completed":
        return { bg: "#DCFCE7", text: "#16A34A", border: "#BBF7D0" };
      case "Cancelled":
        return { bg: "#FEE2E2", text: "#DC2626", border: "#FECACA" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Service Requests</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBarWrapper}>
        <FlatList
          data={STATUS_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabBar}
          renderItem={({ item }) => {
            const isSelected = activeTab === item;
            return (
              <TouchableOpacity
                style={[styles.tabPill, isSelected && styles.tabPillActive]}
                onPress={() => setActiveTab(item)}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    isSelected && styles.tabPillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const badge = getStatusBadgeStyle(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.bg, borderColor: badge.border },
                  ]}
                >
                  <Text style={[styles.statusText, { color: badge.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="calendar" size={13} color="#64748B" />
                  <Text style={styles.metaText}>{item.date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="tag" size={13} color="#64748B" />
                  <Text style={styles.metaText}>{item.priceEstimate}</Text>
                </View>
              </View>

              {item.provider ? (
                <View style={styles.providerRow}>
                  <Image
                    source={{ uri: item.provider.avatarUri }}
                    style={styles.providerAvatar}
                  />
                  <View style={styles.providerInfo}>
                    <Text style={styles.assignedLabel}>Assigned Provider</Text>
                    <Text style={styles.providerName}>
                      {item.provider.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.chatActionBtn}
                    onPress={() =>
                      router.push(`/(customer-tabs)/message` as any)
                    }
                  >
                    <Feather name="message-square" size={16} color="#0052CC" />
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.reqIdText}>{item.id}</Text>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    router.push(`/customer/request-details/${item.id}` as any)
                  }
                >
                  <Text style={styles.actionBtnText}>View Details</Text>
                  <Feather name="chevron-right" size={14} color="#0052CC" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No service requests found</Text>
            <Text style={styles.emptySubtitle}>
              You do not have any requests in this category.
            </Text>
          </View>
        }
      />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  placeholder: {
    width: 32,
  },
  tabBarWrapper: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabBar: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
  },
  tabPillActive: {
    backgroundColor: "#0052CC",
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabPillTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0052CC",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  providerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  providerInfo: {
    flex: 1,
  },
  assignedLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  providerName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  chatActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  reqIdText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0052CC",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
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
