import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";

interface ProviderDetails {
  _id: string;
  fullName: string;
  phone?: string;
  profession?: string;
  rating?: number;
  isVerified?: boolean;
}

interface BidItem {
  _id: string;
  job: string;
  provider: ProviderDetails;
  price: number;
  estimatedDuration: string;
  note?: string;
  status: "pending" | "accepted" | "rejected";
  isBoosted: boolean;
  createdAt: string;
}

interface CustomerJob {
  _id: string;
  title: string;
  category: string;
  description: string;
  subcity: string;
  budget: number;
  urgency: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  createdAt: string;
  assignedProvider?: ProviderDetails;
}

export default function CustomerOrdersScreen() {
  const router = useRouter();

  // Screen State
  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Proposals Review Modal State
  const [bidsModalVisible, setBidsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CustomerJob | null>(null);
  const [jobBids, setJobBids] = useState<BidItem[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);

  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await apiClient.get("/jobs/my-jobs");
      setJobs(res.data);
    } catch (err: any) {
      console.error("Failed to fetch customer orders:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyJobs();
  };

  // Open proposals review sheet
  const handleOpenProposals = async (job: CustomerJob) => {
    setSelectedJob(job);
    setBidsModalVisible(true);
    setLoadingBids(true);
    try {
      // Backend automatically delivers boosted proposals first (.sort({ isBoosted: -1, createdAt: 1 }))
      const res = await apiClient.get(`/bids/job/${job._id}`);
      setJobBids(res.data);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Could not load quotes.",
      );
    } finally {
      setLoadingBids(false);
    }
  };

  // Accept Quote Handler
  const handleAcceptBid = async (bid: BidItem) => {
    Alert.alert(
      "Hire Technician",
      `Accept quote of ${bid.price} ETB from ${bid.provider.fullName}? This will assign the job.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Hire",
          style: "default",
          onPress: async () => {
            setAcceptingBidId(bid._id);
            try {
              await apiClient.patch(`/bids/${bid._id}/accept`);
              setBidsModalVisible(false);

              Alert.alert(
                "Technician Hired! 🎉",
                `${bid.provider.fullName} is now assigned to your job. You can coordinate details in chat.`,
                [
                  {
                    text: "Open Chat",
                    onPress: () =>
                      router.push({
                        pathname: "/(customer-tabs)/message",
                        params: {
                          jobId: bid.job,
                          recipientName: bid.provider.fullName,
                          receiverId: bid.provider._id,
                          recipientPhone: bid.provider.phone,
                        },
                      }),
                  },
                  { text: "Done", style: "cancel" },
                ],
              );

              fetchMyJobs();
            } catch (err: any) {
              Alert.alert(
                "Failed to Accept",
                err.response?.data?.message || "Could not accept quote.",
              );
            } finally {
              setAcceptingBidId(null);
            }
          },
        },
      ],
    );
  };

  // Filter Active vs Completed
  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "active") {
      return job.status === "open" || job.status === "assigned";
    }
    return job.status === "completed" || job.status === "cancelled";
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          Manage your maintenance requests and quotes
        </Text>
      </View>

      {/* Segmented Filter */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.tabTextActive,
            ]}
          >
            Active Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "history" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.tabTextActive,
            ]}
          >
            History & Completed
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Fetching orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0052CC"]}
            />
          }
          renderItem={({ item }) => {
            const isAssigned = item.status === "assigned";

            return (
              <View style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={styles.pillRow}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>
                        {item.category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        isAssigned ? styles.statusAssigned : styles.statusOpen,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isAssigned
                            ? styles.statusTextAssigned
                            : styles.statusTextOpen,
                        ]}
                      >
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.budgetAmount}>{item.budget} ETB</Text>
                </View>

                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={12} color="#64748B" />
                  <Text style={styles.locationText}>{item.subcity}</Text>
                </View>

                <View style={styles.cardFooter}>
                  {isAssigned && item.assignedProvider ? (
                    <View style={styles.assignedContainer}>
                      <View style={styles.providerInfo}>
                        <Feather name="tool" size={14} color="#0052CC" />
                        <Text style={styles.assignedProName}>
                          {item.assignedProvider.fullName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.chatProBtn}
                        onPress={() =>
                          router.push({
                            pathname: "/(customer-tabs)/message",
                            params: {
                              jobId: item._id,
                              recipientName: item.assignedProvider?.fullName,
                              receiverId: item.assignedProvider?._id,
                              recipientPhone: item.assignedProvider?.phone,
                            },
                          })
                        }
                      >
                        <Feather
                          name="message-square"
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text style={styles.chatProBtnText}>Chat Pro</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.viewQuotesBtn}
                      onPress={() => handleOpenProposals(item)}
                      activeOpacity={0.85}
                    >
                      <Feather name="file-text" size={14} color="#0052CC" />
                      <Text style={styles.viewQuotesBtnText}>
                        View Quotes & Proposals
                      </Text>
                      <Feather name="chevron-right" size={16} color="#0052CC" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No orders in this category</Text>
              <Text style={styles.emptySubtitle}>
                Jobs you publish from the Post tab will appear here.
              </Text>
            </View>
          }
        />
      )}

      {/* Proposals Bottom Sheet Modal */}
      <Modal
        visible={bidsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBidsModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Technician Proposals</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {selectedJob?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setBidsModalVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingBids ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0052CC" />
                <Text style={styles.loadingText}>Loading quotes...</Text>
              </View>
            ) : jobBids.length === 0 ? (
              <View style={styles.emptyModalBox}>
                <Feather name="users" size={38} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Quotes Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Certified technicians are reviewing your job request.
                  Proposals will show here automatically.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.proposalsList}
              >
                {jobBids.map((bid) => {
                  const isAccepted = bid.status === "accepted";

                  return (
                    <View
                      key={bid._id}
                      style={[
                        styles.bidCard,
                        bid.isBoosted && styles.bidCardBoosted,
                      ]}
                    >
                      {/* Priority Boost Banner */}
                      {bid.isBoosted && (
                        <View style={styles.boostedTag}>
                          <Feather name="zap" size={11} color="#FFFFFF" />
                          <Text style={styles.boostedTagText}>
                            TOP SPONSORED PROPOSAL
                          </Text>
                        </View>
                      )}

                      <View style={styles.bidHeader}>
                        <View style={styles.providerDetails}>
                          <View style={styles.avatar}>
                            <Feather name="tool" size={18} color="#0052CC" />
                          </View>
                          <View>
                            <View style={styles.nameRow}>
                              <Text style={styles.proName}>
                                {bid.provider.fullName}
                              </Text>
                              {bid.provider.isVerified && (
                                <Feather
                                  name="check-circle"
                                  size={13}
                                  color="#16A34A"
                                />
                              )}
                            </View>
                            <Text style={styles.proMeta}>
                              ⭐ {bid.provider.rating || 5.0} •{" "}
                              {bid.provider.profession || "Technician"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.quoteBox}>
                          <Text style={styles.quotePrice}>{bid.price} ETB</Text>
                          <Text style={styles.quoteDuration}>
                            {bid.estimatedDuration}
                          </Text>
                        </View>
                      </View>

                      {bid.note ? (
                        <Text style={styles.bidNote}>"{bid.note}"</Text>
                      ) : null}

                      {/* Card Action Buttons */}
                      <View style={styles.bidActions}>
                        <TouchableOpacity
                          style={styles.chatActionBtn}
                          onPress={() => {
                            setBidsModalVisible(false);
                            router.push({
                              pathname: "/(customer-tabs)/message",
                              params: {
                                jobId: bid.job,
                                recipientName: bid.provider.fullName,
                                receiverId: bid.provider._id,
                                recipientPhone: bid.provider.phone,
                              },
                            });
                          }}
                        >
                          <Feather
                            name="message-circle"
                            size={15}
                            color="#0052CC"
                          />
                          <Text style={styles.chatActionText}>Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.acceptActionBtn,
                            isAccepted && styles.acceptActionBtnDisabled,
                          ]}
                          onPress={() => handleAcceptBid(bid)}
                          disabled={isAccepted || acceptingBidId === bid._id}
                        >
                          {acceptingBidId === bid._id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.acceptActionText}>
                              {isAccepted ? "Hired" : "Accept & Hire"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  tabBtnActive: { backgroundColor: "#0052CC" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  tabTextActive: { color: "#FFFFFF" },
  listContent: { padding: 16, paddingBottom: 100 },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pillRow: { flexDirection: "row", gap: 6 },
  categoryPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusOpen: { backgroundColor: "#EFF6FF" },
  statusAssigned: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: 10, fontWeight: "800" },
  statusTextOpen: { color: "#0052CC" },
  statusTextAssigned: { color: "#16A34A" },
  budgetAmount: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 12,
  },
  locationText: { fontSize: 12, color: "#64748B" },
  cardFooter: { borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 },
  viewQuotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewQuotesBtnText: { fontSize: 13, fontWeight: "700", color: "#0052CC" },
  assignedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  providerInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  assignedProName: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  chatProBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0052CC",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chatProBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: { marginTop: 10, fontSize: 13, color: "#64748B" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    maxWidth: 260,
  },
  closeBtn: { padding: 4 },
  emptyModalBox: { alignItems: "center", paddingVertical: 40 },
  proposalsList: { paddingBottom: 20 },
  bidCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
  },
  bidCardBoosted: {
    borderColor: "#0052CC",
    backgroundColor: "#FBFDFF",
  },
  boostedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0052CC",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 10,
  },
  boostedTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bidHeader: { flexDirection: "row", justifyContent: "space-between" },
  providerDetails: { flexDirection: "row", gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  proName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  proMeta: { fontSize: 11, color: "#64748B", marginTop: 2 },
  quoteBox: { alignItems: "flex-end" },
  quotePrice: { fontSize: 16, fontWeight: "800", color: "#0052CC" },
  quoteDuration: { fontSize: 11, color: "#64748B", marginTop: 1 },
  bidNote: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  bidActions: { flexDirection: "row", gap: 10, marginTop: 10 },
  chatActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  chatActionText: { fontSize: 13, fontWeight: "700", color: "#0052CC" },
  acceptActionBtn: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    borderRadius: 8,
    backgroundColor: "#0052CC",
  },
  acceptActionBtnDisabled: { backgroundColor: "#16A34A" },
  acceptActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
