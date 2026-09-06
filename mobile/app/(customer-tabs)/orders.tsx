import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";
import { Alert } from "../../src/context/AlertContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import { OrderCard } from "../../components/customer/OrderCard";

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
  rating?: number;
  review?: string;
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

  // Rating & Review Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [ratingJob, setRatingJob] = useState<CustomerJob | null>(null);
  const [starCount, setStarCount] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await apiClient.get("/jobs/my-jobs");
      setJobs(Array.isArray(res.data) ? res.data : []);
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
  const handleOpenProposals = async (job: any) => {
    setSelectedJob(job);
    setBidsModalVisible(true);
    setLoadingBids(true);
    try {
      const res = await apiClient.get(`/bids/job/${job._id}`);
      setJobBids(Array.isArray(res.data) ? res.data : []);
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

  // Prompt Complete Job
  const handlePromptComplete = (job: any) => {
    Alert.alert(
      "Mark Job as Completed?",
      `Has ${job.assignedProvider?.fullName || "the technician"} finished all requested repairs to your satisfaction?`,
      [
        { text: "Not Yet", style: "cancel" },
        {
          text: "Yes, Completed",
          style: "default",
          onPress: async () => {
            try {
              await apiClient.patch(`/jobs/${job._id}/complete`);
              setRatingJob(job);
              setStarCount(5);
              setReviewComment("");
              setReviewModalVisible(true);
              fetchMyJobs();
            } catch (err: any) {
              Alert.alert(
                "Action Failed",
                err.response?.data?.message || "Could not complete order.",
              );
            }
          },
        },
      ],
    );
  };

  // Submit Rating & Feedback
  const handleSubmitReview = async () => {
    if (!ratingJob) return;

    setSubmittingReview(true);
    try {
      await apiClient.post(`/jobs/${ratingJob._id}/rate-review`, {
        rating: starCount,
        review: reviewComment.trim(),
        providerId: ratingJob.assignedProvider?._id,
      });

      setReviewModalVisible(false);
      setRatingJob(null);
      Alert.alert("Thank You! 🌟", "Your rating and feedback have been saved.");
      fetchMyJobs();
    } catch (err: any) {
      Alert.alert(
        "Failed to Submit",
        err.response?.data?.message || "Could not save review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper to determine whether an order has been reviewed
  const isJobReviewed = (job: CustomerJob) => {
    return Boolean(
      job.rating ||
      (typeof job.review === "object" && job.review ? (job.review as any).rating : null) ||
      (job as any).reviewDetails ||
      (job as any).isReviewed
    );
  };

  // Filter Active vs Completed
  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "active") {
      // In Active Requests: Allow customers to rate and review a service after it is completed!
      // Keep open, assigned, and completed jobs awaiting review in Active Requests
      return (
        job.status === "open" ||
        job.status === "assigned" ||
        (job.status === "completed" && !isJobReviewed(job))
      );
    }
    // In History & Completed: Show all completed and cancelled jobs
    return job.status === "completed" || job.status === "cancelled";
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          Manage your maintenance requests, active jobs, and ratings
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
          renderItem={({ item }) => (
            <OrderCard
              job={item as any}
              onViewQuotes={handleOpenProposals}
              onChat={(job) => {
                if (!job.assignedProvider) return;
                router.push({
                  pathname: "/(customer-tabs)/message",
                  params: {
                    jobId: job._id,
                    recipientName: job.assignedProvider.fullName,
                    receiverId: job.assignedProvider._id,
                    recipientPhone: job.assignedProvider.phone,
                  },
                });
              }}
              onComplete={handlePromptComplete}
              onRate={(job) => {
                setRatingJob(job as any);
                setStarCount(5);
                setReviewComment("");
                setReviewModalVisible(true);
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="clipboard"
                size={moderateScale(44)}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>No orders in this tab</Text>
              <Text style={styles.emptySubtitle}>
                Published jobs and past repairs will show up here.
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
                <Feather name="x" size={moderateScale(20)} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loadingBids ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#0052CC" />
                <Text style={styles.loadingText}>Loading quotes...</Text>
              </View>
            ) : jobBids.length === 0 ? (
              <View style={styles.emptyModalBox}>
                <Feather
                  name="users"
                  size={moderateScale(38)}
                  color="#CBD5E1"
                />
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
                      {bid.isBoosted && (
                        <View style={styles.boostedTag}>
                          <Feather
                            name="zap"
                            size={moderateScale(11)}
                            color="#FFFFFF"
                          />
                          <Text style={styles.boostedTagText}>
                            TOP SPONSORED PROPOSAL
                          </Text>
                        </View>
                      )}

                      <View style={styles.bidHeader}>
                        <View style={styles.providerDetails}>
                          <View style={styles.avatar}>
                            <Feather
                              name="tool"
                              size={moderateScale(18)}
                              color="#0052CC"
                            />
                          </View>
                          <View>
                            <View style={styles.nameRow}>
                              <Text style={styles.proName}>
                                {bid.provider.fullName}
                              </Text>
                              {bid.provider.isVerified && (
                                <Feather
                                  name="check-circle"
                                  size={moderateScale(13)}
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
                            size={moderateScale(15)}
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

      {/* Rating & Feedback Bottom Sheet Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Rate Your Experience</Text>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  {ratingJob?.assignedProvider?.fullName || "Technician"} •{" "}
                  {ratingJob?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={moderateScale(20)} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Star Selector */}
            <View style={styles.starSelectionRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setStarCount(star)}
                  activeOpacity={0.7}
                  style={styles.starTouchArea}
                >
                  <FontAwesome
                    name={star <= starCount ? "star" : "star-o"}
                    size={moderateScale(32)}
                    color={star <= starCount ? "#F59E0B" : "#CBD5E1"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.starRatingNotice}>
              {starCount === 5
                ? "Excellent service!"
                : starCount === 4
                  ? "Good work!"
                  : starCount === 3
                    ? "Average repair"
                    : "Needs improvement"}
            </Text>

            {/* Feedback Input */}
            <Text style={styles.reviewLabel}>Leave a Review (Optional)</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Was the provider punctual, polite, and thorough?"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={reviewComment}
              onChangeText={setReviewComment}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitReviewBtn,
                submittingReview && styles.btnDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
              activeOpacity={0.85}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitReviewBtnText}>
                  Submit Rating & Review
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
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: scaledFont(20),
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(2),
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(20),
    paddingBottom: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: scale(8),
  },
  tabBtn: {
    flex: 1,
    paddingVertical: scale(8),
    alignItems: "center",
    borderRadius: moderateScale(8),
    backgroundColor: "#F1F5F9",
  },
  tabBtnActive: { backgroundColor: "#0052CC" },
  tabText: { fontSize: scaledFont(12), fontWeight: "700", color: "#64748B" },
  tabTextActive: { color: "#FFFFFF" },
  listContent: { padding: scale(16), paddingBottom: scale(110) },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    padding: scale(15),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },
  pillRow: { flexDirection: "row", gap: scale(6) },
  categoryPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  categoryPillText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#475569",
  },
  statusPill: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  statusOpen: { backgroundColor: "#EFF6FF" },
  statusAssigned: { backgroundColor: "#FEF3C7" },
  statusCompleted: { backgroundColor: "#DCFCE7" },
  statusText: { fontSize: scaledFont(10), fontWeight: "800" },
  statusTextOpen: { color: "#0052CC" },
  statusTextAssigned: { color: "#D97706" },
  statusTextCompleted: { color: "#16A34A" },
  budgetAmount: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#0F172A",
  },
  jobTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: scale(4),
  },
  jobDescription: {
    fontSize: scaledFont(12),
    color: "#64748B",
    lineHeight: scale(17),
    marginBottom: scale(10),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    marginBottom: scale(12),
  },
  locationText: { fontSize: scaledFont(11), color: "#64748B" },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: scale(10),
  },
  viewQuotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    paddingVertical: scale(9),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
  },
  viewQuotesBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
  assignedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    flex: 1,
  },
  assignedProName: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#0F172A",
  },
  assignedActionsRow: { flexDirection: "row", gap: scale(8) },
  chatProBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(8),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#16A34A",
    paddingHorizontal: scale(12),
    height: moderateScale(36),
    borderRadius: moderateScale(8),
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(12),
    fontWeight: "700",
  },
  completedFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedNotice: { fontSize: scaledFont(11), color: "#64748B", flex: 1 },
  ratedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#FEF3C7",
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: moderateScale(6),
  },
  ratedText: { fontSize: scaledFont(11), fontWeight: "700", color: "#B45309" },
  rateNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: moderateScale(8),
  },
  rateNowText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#0052CC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(60),
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scale(80),
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
    textAlign: "center",
    marginTop: scale(4),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingTop: scale(18),
    paddingBottom: scale(36),
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  modalTitle: { fontSize: scaledFont(17), fontWeight: "800", color: "#0F172A" },
  modalSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
    maxWidth: scale(260),
  },
  closeBtn: { padding: scale(4) },
  emptyModalBox: { alignItems: "center", paddingVertical: scale(40) },
  proposalsList: { paddingBottom: scale(20) },
  bidCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: scale(14),
    marginBottom: scale(12),
  },
  bidCardBoosted: {
    borderColor: "#0052CC",
    backgroundColor: "#FBFDFF",
  },
  boostedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    backgroundColor: "#0052CC",
    alignSelf: "flex-start",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(4),
    marginBottom: scale(10),
  },
  boostedTagText: {
    color: "#FFFFFF",
    fontSize: scaledFont(9),
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bidHeader: { flexDirection: "row", justifyContent: "space-between" },
  providerDetails: { flexDirection: "row", gap: scale(10) },
  avatar: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: scale(5) },
  proName: { fontSize: scaledFont(13), fontWeight: "700", color: "#0F172A" },
  proMeta: { fontSize: scaledFont(11), color: "#64748B", marginTop: 2 },
  quoteBox: { alignItems: "flex-end" },
  quotePrice: { fontSize: scaledFont(15), fontWeight: "800", color: "#0052CC" },
  quoteDuration: { fontSize: scaledFont(11), color: "#64748B", marginTop: 1 },
  bidNote: {
    fontSize: scaledFont(12),
    color: "#334155",
    fontStyle: "italic",
    backgroundColor: "#F8FAFC",
    padding: scale(10),
    borderRadius: moderateScale(8),
    marginVertical: scale(10),
  },
  bidActions: { flexDirection: "row", gap: scale(10), marginTop: scale(10) },
  chatActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    height: scale(38),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  chatActionText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
  acceptActionBtn: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    height: scale(38),
    borderRadius: moderateScale(8),
    backgroundColor: "#0052CC",
  },
  acceptActionBtnDisabled: { backgroundColor: "#16A34A" },
  acceptActionText: {
    color: "#FFFFFF",
    fontSize: scaledFont(12),
    fontWeight: "700",
  },
  starSelectionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(14),
    marginTop: scale(10),
  },
  starTouchArea: { padding: scale(4) },
  starRatingNotice: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
    textAlign: "center",
    marginTop: scale(6),
    marginBottom: scale(14),
  },
  reviewLabel: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: scale(6),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reviewInput: {
    height: scale(80),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingTop: scale(10),
    fontSize: scaledFont(13),
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: scale(20),
  },
  submitReviewBtn: {
    height: scale(46),
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  submitReviewBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
  btnDisabled: {
    backgroundColor: "#94A3B8",
  },
});