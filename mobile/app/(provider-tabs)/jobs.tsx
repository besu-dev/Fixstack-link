import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";
import BuyConnectsModal from "../../components/BuyConnectsModal";
import { Alert } from "../../src/context/AlertContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

interface Job {
  _id: string;
  title: string;
  category: string;
  description: string;
  subcity: string;
  specificLocation?: string;
  budget: number;
  urgency: "Emergency" | "Today" | "Flexible";
  photos: string[];
  createdAt: string;
  customer?: {
    _id: string;
    fullName: string;
    phone?: string;
  };
}

const CATEGORY_PILLS = [
  "All",
  "Plumbing",
  "Electrical",
  "Solar Technician",
  "Air Conditioning",
  "Appliances & Mitad",
  "Gate & Metalwork",
  "General Maintenance",
];

const DURATION_OPTIONS = ["1-2 hours", "Half Day", "Full Day", "2+ Days"];

export default function ProviderJobsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Connects & Wallet State
  const [connectsBalance, setConnectsBalance] = useState<number>(0);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Proposal / Bid Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidDuration, setBidDuration] = useState("1-2 hours");
  const [bidNote, setBidNote] = useState("");
  const [isBoosted, setIsBoosted] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  // <= 1000 ETB costs 2 Connects, > 1000 ETB costs 4 Connects; Boost adds +5
  const baseConnects = Number(bidPrice) > 1000 ? 4 : 2;
  const totalRequiredConnects = baseConnects + (isBoosted ? 5 : 0);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await apiClient.get("/wallet/balance");
      setConnectsBalance(res.data.connectsBalance ?? 0);
    } catch (err: any) {
      console.error("Failed to load technician wallet:", err.message);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await apiClient.get("/jobs");
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.jobs || [];
      setJobs(list);
    } catch (err: any) {
      console.error("Failed to load jobs:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchWallet();
  }, [fetchJobs, fetchWallet]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
    fetchWallet();
  };

  const openBidModal = (job: Job) => {
    setSelectedJob(job);
    setBidPrice(job.budget ? job.budget.toString() : "");
    setBidDuration("1-2 hours");
    setBidNote("");
    setIsBoosted(false);
    setModalVisible(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedJob) return;
    if (!bidPrice.trim() || isNaN(Number(bidPrice))) {
      Alert.alert("Invalid Price", "Please enter a valid price in ETB.");
      return;
    }

    if (connectsBalance < totalRequiredConnects) {
      setModalVisible(false);
      setShowWalletModal(true);
      return;
    }

    setSubmittingBid(true);
    try {
      await apiClient.post("/bids", {
        jobId: selectedJob._id,
        price: Number(bidPrice),
        estimatedDuration: bidDuration,
        note: bidNote.trim() || "Ready with all required tools and equipment.",
        isBoosted,
      });

      setConnectsBalance((prev) => Math.max(0, prev - totalRequiredConnects));
      setModalVisible(false);

      Alert.alert(
        "Proposal Sent! 🚀",
        `Your bid of ${bidPrice} ETB was submitted (${totalRequiredConnects} connects used).${
          isBoosted ? " Proposal is boosted to top placement." : ""
        }`,
      );
    } catch (err: any) {
      if (err.response?.status === 402) {
        setModalVisible(false);
        setShowWalletModal(true);
      } else {
        Alert.alert(
          "Bid Failed",
          err.response?.data?.message ||
            "Could not submit bid. Please try again.",
        );
      }
    } finally {
      setSubmittingBid(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory =
      selectedCategory === "All" || job.category === selectedCategory;
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.subcity.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getUrgencyBadge = (urgency: Job["urgency"]) => {
    switch (urgency) {
      case "Emergency":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "Today":
        return { bg: "#FEF3C7", text: "#D97706" };
      default:
        return { bg: "#EFF6FF", text: "#0052CC" };
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Available Jobs</Text>
          <Text style={styles.headerSubtitle}>
            Discover work requests near your service zone
          </Text>
        </View>

        {/* Connects Balance Pill */}
        <TouchableOpacity
          style={styles.connectsPill}
          onPress={() => setShowWalletModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="zap" size={moderateScale(13)} color="#0052CC" />
          <Text style={styles.connectsPillText}>
            {connectsBalance} Connects
          </Text>
          <Feather
            name="plus-circle"
            size={moderateScale(13)}
            color="#0052CC"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
            placeholder="Search by issue, woreda, or sub-city..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={moderateScale(18)} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryPillsWrapper}>
        <FlatList
          data={CATEGORY_PILLS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryPillsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Fetching available requests...</Text>
        </View>
      ) : (
        /* Jobs Feed */
        <FlatList
          data={filteredJobs}
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
            const urgencyStyle = getUrgencyBadge(item.urgency);
            return (
              <View style={styles.jobCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.urgencyBadge,
                        { backgroundColor: urgencyStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.urgencyBadgeText,
                          { color: urgencyStyle.text },
                        ]}
                      >
                        {item.urgency}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.budgetAmount}>{item.budget} ETB</Text>
                </View>

                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.metaDivider} />

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather
                      name="map-pin"
                      size={moderateScale(13)}
                      color="#64748B"
                    />
                    <Text style={styles.metaText}>{item.subcity}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather
                      name="clock"
                      size={moderateScale(13)}
                      color="#94A3B8"
                    />
                    <Text style={styles.metaText}>
                      {formatRelativeTime(item.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather
                      name="user"
                      size={moderateScale(13)}
                      color="#64748B"
                    />
                    <Text style={styles.metaText}>
                      {item.customer?.fullName || "Verified Customer"}
                    </Text>
                  </View>
                  {item.photos && item.photos.length > 0 && (
                    <View style={styles.metaItem}>
                      <Feather
                        name="image"
                        size={moderateScale(13)}
                        color="#0052CC"
                      />
                      <Text style={[styles.metaText, { color: "#0052CC" }]}>
                        {item.photos.length} attached
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {/* Chat Client Button */}
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/(provider-tabs)/message",
                        params: {
                          jobId: item._id,
                          recipientName: item.customer?.fullName || "Customer",
                          receiverId: item.customer?._id,
                        },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="message-square"
                      size={moderateScale(14)}
                      color="#0052CC"
                    />
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </TouchableOpacity>

                  {/* View Scope Button */}
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() =>
                      router.push(`/provider/job-details/${item._id}` as any)
                    }
                  >
                    <Text style={styles.detailsBtnText}>Scope</Text>
                  </TouchableOpacity>

                  {/* Send Quote Button */}
                  <TouchableOpacity
                    style={styles.quoteBtn}
                    onPress={() => openBidModal(item)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.quoteBtnText}>Send Quote</Text>
                    <Feather
                      name="send"
                      size={moderateScale(13)}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={moderateScale(44)} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No matching job requests</Text>
              <Text style={styles.emptySubtitle}>
                Try selecting "All" or pull down to check for newly published
                requests.
              </Text>
            </View>
          }
        />
      )}

      {/* Bid / Proposal Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Submit Quote</Text>
                <Text style={styles.modalSub}>{selectedJob?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Feather name="x" size={moderateScale(20)} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Proposed Price */}
            <Text style={styles.modalLabel}>
              Your Price (ETB) - Customer Budget: {selectedJob?.budget} ETB
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={bidPrice}
              onChangeText={setBidPrice}
              placeholder="e.g., 1200"
              placeholderTextColor="#94A3B8"
            />

            {/* Estimated Duration */}
            <Text style={styles.modalLabel}>Estimated Time</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durationChip,
                    bidDuration === d && styles.durationChipActive,
                  ]}
                  onPress={() => setBidDuration(d)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      bidDuration === d && styles.durationTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note to Customer */}
            <Text style={styles.modalLabel}>Message / Work Details</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              multiline
              numberOfLines={3}
              value={bidNote}
              onChangeText={setBidNote}
              placeholder="Describe your tools, guarantee, or when you can arrive..."
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />

            {/* Proposal Boost Toggle Box */}
            <TouchableOpacity
              style={[styles.boostBox, isBoosted && styles.boostBoxActive]}
              onPress={() => setIsBoosted(!isBoosted)}
              activeOpacity={0.8}
            >
              <Feather
                name={isBoosted ? "check-square" : "square"}
                size={moderateScale(20)}
                color={isBoosted ? "#0052CC" : "#64748B"}
              />
              <View style={styles.boostContent}>
                <View style={styles.boostTitleRow}>
                  <Text style={styles.boostTitle}>⚡ Boost Proposal</Text>
                  <Text style={styles.boostBadge}>+5 Connects</Text>
                </View>
                <Text style={styles.boostSubtitle}>
                  Pins your proposal directly to the top when the client reviews
                  quotes.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Connect Deduction Info Pill */}
            <View style={styles.deductionSummary}>
              <Feather name="info" size={moderateScale(13)} color="#64748B" />
              <Text style={styles.deductionText}>
                Cost:{" "}
                <Text style={styles.boldText}>
                  {totalRequiredConnects} Connects
                </Text>{" "}
                ({baseConnects} base{isBoosted ? " + 5 boost" : ""}).
              </Text>
            </View>

            {/* Modal Action Button */}
            <TouchableOpacity
              style={[
                styles.sendBidBtn,
                submittingBid && styles.sendBidBtnDisabled,
              ]}
              onPress={handleSubmitBid}
              disabled={submittingBid}
              activeOpacity={0.85}
            >
              {submittingBid ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.sendBidBtnText}>
                  Send Proposal ({totalRequiredConnects} Connects)
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Buy Connects Wallet Modal */}
      <BuyConnectsModal
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        currentBalance={connectsBalance}
        onSuccess={(newBal) => setConnectsBalance(newBal)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    backgroundColor: "#FFFFFF",
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: scale(10),
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
  connectsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: moderateScale(20),
  },
  connectsPillText: {
    fontSize: scaledFont(11),
    fontWeight: "800",
    color: "#0052CC",
  },
  searchWrapper: {
    paddingHorizontal: scale(20),
    paddingVertical: scale(10),
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    height: scale(44),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: scaledFont(13),
    color: "#0F172A",
  },
  categoryPillsWrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryPillsContainer: {
    paddingHorizontal: scale(20),
    gap: scale(8),
  },
  categoryPill: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    borderRadius: moderateScale(20),
    backgroundColor: "#F1F5F9",
  },
  categoryPillActive: {
    backgroundColor: "#0052CC",
  },
  categoryPillText: {
    fontSize: scaledFont(11),
    fontWeight: "600",
    color: "#64748B",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  listContent: {
    padding: scale(18),
    paddingBottom: scale(110),
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: scale(15),
    marginBottom: scale(14),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },
  badgeRow: {
    flexDirection: "row",
    gap: scale(6),
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  categoryBadgeText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
    color: "#0052CC",
  },
  urgencyBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  urgencyBadgeText: {
    fontSize: scaledFont(10),
    fontWeight: "700",
  },
  budgetAmount: {
    fontSize: scaledFont(14),
    fontWeight: "800",
    color: "#0F172A",
  },
  jobTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: scaledFont(20),
  },
  jobDescription: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(4),
    lineHeight: scale(17),
  },
  metaDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: scale(10),
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(6),
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
  },
  metaText: {
    fontSize: scaledFont(11),
    color: "#475569",
  },
  cardActions: {
    flexDirection: "row",
    gap: scale(8),
    marginTop: scale(10),
  },
  chatBtn: {
    flex: 1,
    height: scale(38),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(5),
  },
  chatBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
  detailsBtn: {
    flex: 1,
    height: scale(38),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  detailsBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#334155",
  },
  quoteBtn: {
    flex: 1.4,
    height: scale(38),
    borderRadius: moderateScale(8),
    backgroundColor: "#0052CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(5),
  },
  quoteBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(60),
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
    textAlign: "center",
    marginTop: scale(4),
    lineHeight: scale(16),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingTop: scale(18),
    paddingBottom: scale(36),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: scale(14),
  },
  modalTitle: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSub: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(2),
    maxWidth: scale(260),
  },
  closeModalBtn: {
    padding: scale(4),
  },
  modalLabel: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#1E293B",
    marginTop: scale(10),
    marginBottom: scale(6),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalInput: {
    height: scale(44),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    fontSize: scaledFont(13),
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  modalTextArea: {
    height: scale(65),
    paddingTop: scale(8),
  },
  durationRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  durationChip: {
    flex: 1,
    paddingVertical: scale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  durationChipActive: {
    borderColor: "#0052CC",
    backgroundColor: "#EFF6FF",
  },
  durationText: {
    fontSize: scaledFont(10),
    fontWeight: "600",
    color: "#64748B",
  },
  durationTextActive: {
    color: "#0052CC",
  },
  boostBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(12),
    padding: scale(10),
    marginTop: scale(12),
    gap: scale(10),
  },
  boostBoxActive: {
    borderColor: "#0052CC",
    backgroundColor: "#EFF6FF",
  },
  boostContent: {
    flex: 1,
  },
  boostTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  boostTitle: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0F172A",
  },
  boostBadge: {
    fontSize: scaledFont(10),
    fontWeight: "800",
    color: "#0052CC",
  },
  boostSubtitle: {
    fontSize: scaledFont(10),
    color: "#64748B",
    marginTop: scale(2),
    lineHeight: scaledFont(14),
  },
  deductionSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#F1F5F9",
    padding: scale(10),
    borderRadius: moderateScale(8),
    marginTop: scale(12),
  },
  deductionText: {
    fontSize: scaledFont(11),
    color: "#64748B",
    flex: 1,
  },
  boldText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  sendBidBtn: {
    height: scale(46),
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(23),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(16),
  },
  sendBidBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  sendBidBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
});
