import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";

interface Provider {
  _id: string;
  fullName: string;
  phone: string;
  profession: string;
  rating: number;
}

interface Bid {
  _id: string;
  provider: Provider;
  price: number;
  estimatedDuration: string;
  note: string;
  status: "pending" | "accepted" | "rejected";
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
  assignedProvider?: Provider;
  createdAt: string;
}

export default function CustomerOrdersScreen() {
  const router = useRouter();

  const [jobs, setJobs] = useState<CustomerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Bids Modal State
  const [bidsModalVisible, setBidsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<CustomerJob | null>(null);
  const [jobBids, setJobBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

  // Review & Completion Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [jobToReview, setJobToReview] = useState<CustomerJob | null>(null);
  const [starRating, setStarRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMyJobs = useCallback(async () => {
    try {
      const response = await apiClient.get("/jobs/my-jobs");
      setJobs(response.data);
    } catch (err: any) {
      console.error(
        "Error fetching my jobs:",
        err?.response?.data || err.message,
      );
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

  const handleOpenBids = async (job: CustomerJob) => {
    setSelectedJob(job);
    setBidsModalVisible(true);
    setLoadingBids(true);
    try {
      const res = await apiClient.get(`/bids/job/${job._id}`);
      setJobBids(res.data);
    } catch (err: any) {
      Alert.alert("Error", "Could not load proposals for this request.");
    } finally {
      setLoadingBids(false);
    }
  };

  const handleAcceptBid = (bid: Bid) => {
    Alert.alert(
      "Confirm Provider",
      `Hire ${bid.provider.fullName} for ${bid.price} ETB?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Hire",
          onPress: async () => {
            try {
              await apiClient.patch(`/bids/${bid._id}/accept`);
              Alert.alert(
                "Provider Assigned! 🎉",
                `You have hired ${bid.provider.fullName}. You can now chat or call them directly.`,
                [
                  {
                    text: "Open Chat",
                    onPress: () => {
                      if (selectedJob) {
                        router.push({
                          pathname: "/(customer-tabs)/message",
                          params: {
                            jobId: selectedJob._id,
                            recipientName: bid.provider.fullName,
                            receiverId: bid.provider._id,
                          },
                        });
                      }
                    },
                  },
                  { text: "Later" },
                ],
              );
              setBidsModalVisible(false);
              fetchMyJobs();
            } catch (err: any) {
              Alert.alert(
                "Action Failed",
                err?.response?.data?.message || "Could not accept bid.",
              );
            }
          },
        },
      ],
    );
  };

  const openReviewModal = (job: CustomerJob) => {
    setJobToReview(job);
    setStarRating(5);
    setReviewComment("");
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!jobToReview) return;
    setSubmittingReview(true);
    try {
      // 1. Mark job as complete
      await apiClient.patch(`/jobs/${jobToReview._id}/complete`);

      // 2. Submit rating and feedback
      await apiClient.post(`/jobs/${jobToReview._id}/review`, {
        rating: starRating,
        comment: reviewComment.trim(),
      });

      setReviewModalVisible(false);
      Alert.alert(
        "Job Completed! 🌟",
        "Thank you for rating and reviewing your technician.",
      );
      fetchMyJobs();
    } catch (err: any) {
      Alert.alert(
        "Submission Failed",
        err?.response?.data?.message || "Could not complete review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: CustomerJob["status"]) => {
    switch (status) {
      case "open":
        return { bg: "#EFF6FF", text: "#0052CC", label: "Open for Bids" };
      case "assigned":
        return { bg: "#FEF3C7", text: "#D97706", label: "Technician Assigned" };
      case "completed":
        return { bg: "#DCFCE7", text: "#16A34A", label: "Completed" };
      default:
        return { bg: "#F1F5F9", text: "#64748B", label: status };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Service Requests</Text>
          <Text style={styles.headerSubtitle}>
            Track bids and active technicians
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Feather name="refresh-cw" size={18} color="#0052CC" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0052CC"]}
            />
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: badge.text }]}
                    >
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={styles.budgetAmount}>{item.budget} ETB</Text>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.metaDivider} />

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="map-pin" size={13} color="#64748B" />
                    <Text style={styles.metaText}>{item.subcity}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="tag" size={13} color="#0052CC" />
                    <Text style={[styles.metaText, { color: "#0052CC" }]}>
                      {item.category}
                    </Text>
                  </View>
                </View>

                {/* Assigned Provider Block */}
                {item.status === "assigned" && item.assignedProvider && (
                  <View style={styles.assignedBox}>
                    <View style={styles.assignedInfo}>
                      <Text style={styles.assignedName}>
                        {item.assignedProvider.fullName}
                      </Text>
                      <Text style={styles.assignedTrade}>
                        {item.assignedProvider.profession || "Technician"} • ⭐{" "}
                        {item.assignedProvider.rating?.toFixed(1) || "5.0"}
                      </Text>
                    </View>

                    <View style={styles.actionButtonRow}>
                      <TouchableOpacity
                        style={styles.chatBtn}
                        onPress={() =>
                          router.push({
                            pathname: "/(customer-tabs)/message",
                            params: {
                              jobId: item._id,
                              recipientName: item.assignedProvider?.fullName,
                              receiverId: item.assignedProvider?._id,
                            },
                          })
                        }
                        activeOpacity={0.8}
                      >
                        <Feather
                          name="message-square"
                          size={14}
                          color="#FFFFFF"
                        />
                        <Text style={styles.btnText}>Chat</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() =>
                          Linking.openURL(`tel:${item.assignedProvider?.phone}`)
                        }
                        activeOpacity={0.8}
                      >
                        <Feather name="phone" size={14} color="#FFFFFF" />
                        <Text style={styles.btnText}>Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => openReviewModal(item)}
                        activeOpacity={0.8}
                      >
                        <Feather name="check-circle" size={14} color="#FFFFFF" />
                        <Text style={styles.btnText}>Finish & Rate</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {item.status === "completed" && (
                  <View style={styles.completedNotice}>
                    <Feather name="check-circle" size={16} color="#16A34A" />
                    <Text style={styles.completedNoticeText}>
                      Service fulfilled and reviewed
                    </Text>
                  </View>
                )}

                {item.status === "open" && (
                  <TouchableOpacity
                    style={styles.viewBidsBtn}
                    onPress={() => handleOpenBids(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewBidsBtnText}>View Proposals</Text>
                    <Feather name="chevron-right" size={16} color="#0052CC" />
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No service requests yet</Text>
              <Text style={styles.emptySubtitle}>
                Requests you publish will show up here along with technician
                proposals.
              </Text>
            </View>
          }
        />
      )}

      {/* Bids Review Modal */}
      <Modal
        visible={bidsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBidsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Technician Proposals</Text>
                <Text style={styles.modalSub}>{selectedJob?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setBidsModalVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingBids ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color="#0052CC" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {jobBids.length === 0 ? (
                  <View style={styles.emptyBids}>
                    <Feather name="clock" size={32} color="#94A3B8" />
                    <Text style={styles.emptyBidsText}>
                      No technicians have submitted a quote yet. Check back
                      soon.
                    </Text>
                  </View>
                ) : (
                  jobBids.map((bid) => (
                    <View key={bid._id} style={styles.bidCard}>
                      <View style={styles.bidCardHeader}>
                        <View>
                          <Text style={styles.providerName}>
                            {bid.provider.fullName}
                          </Text>
                          <Text style={styles.providerProfession}>
                            {bid.provider.profession || "Certified Pro"} • ⭐{" "}
                            {bid.provider.rating?.toFixed(1) || "5.0"}
                          </Text>
                        </View>
                        <Text style={styles.bidPrice}>{bid.price} ETB</Text>
                      </View>

                      {bid.note ? (
                        <Text style={styles.bidNote}>"{bid.note}"</Text>
                      ) : null}

                      <View style={styles.bidFooter}>
                        <Text style={styles.bidDuration}>
                          ⏱ Est. Duration: {bid.estimatedDuration}
                        </Text>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => handleAcceptBid(bid)}
                        >
                          <Text style={styles.acceptBtnText}>
                            Accept & Hire
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Review & Completion Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Rate Technician</Text>
                <Text style={styles.modalSub}>
                  {jobToReview?.assignedProvider?.fullName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Interactive Stars */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setStarRating(star)}
                  activeOpacity={0.7}
                >
                  <FontAwesome5
                    name="star"
                    solid={star <= starRating}
                    size={32}
                    color={star <= starRating ? "#F59E0B" : "#CBD5E1"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Leave Feedback (Optional)</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Was the work done cleanly, on time, and accurately?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={reviewComment}
              onChangeText={setReviewComment}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitReviewBtn}
              onPress={handleSubmitReview}
              disabled={submittingReview}
              activeOpacity={0.85}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitReviewBtnText}>
                  Complete Job & Submit Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 13, color: "#64748B" },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  budgetAmount: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  cardDesc: { fontSize: 13, color: "#64748B", marginTop: 4, lineHeight: 18 },
  metaDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 10 },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: "#475569" },
  viewBidsBtn: {
    marginTop: 12,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  viewBidsBtnText: { fontSize: 13, fontWeight: "700", color: "#0052CC" },
  assignedBox: {
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
    flexDirection: "column",
    gap: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  assignedInfo: { width: "100%" },
  assignedName: { fontSize: 15, fontWeight: "700", color: "#166534" },
  assignedTrade: { fontSize: 12, color: "#15803D", marginTop: 2 },
  actionButtonRow: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "flex-end",
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0052CC",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0284C7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  completedNotice: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: 8,
  },
  completedNoticeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
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
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  modalSub: { fontSize: 12, color: "#64748B", marginTop: 2, maxWidth: 260 },
  closeBtn: { padding: 4 },
  modalLoading: { paddingVertical: 40, alignItems: "center" },
  emptyBids: { paddingVertical: 40, alignItems: "center", gap: 8 },
  emptyBidsText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  bidCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bidCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  providerName: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  providerProfession: { fontSize: 12, color: "#64748B", marginTop: 2 },
  bidPrice: { fontSize: 16, fontWeight: "800", color: "#0052CC" },
  bidNote: {
    fontSize: 12,
    color: "#334155",
    fontStyle: "italic",
    marginTop: 8,
  },
  bidFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  bidDuration: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  acceptBtn: {
    backgroundColor: "#0052CC",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  acceptBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 18,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  reviewInput: {
    height: 80,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F8FAFC",
    fontSize: 14,
    color: "#0F172A",
  },
  submitReviewBtn: {
    marginTop: 18,
    height: 48,
    backgroundColor: "#16A34A",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitReviewBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});