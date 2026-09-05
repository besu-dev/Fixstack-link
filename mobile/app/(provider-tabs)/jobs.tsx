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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";
import BuyConnectsModal from "../../components/BuyConnectsModal";

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
    phone: string;
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

  // Dynamic Connects Rule:
  // <= 1000 ETB costs 2 Connects, > 1000 ETB costs 4 Connects; Boost adds +5
  const baseConnects = Number(bidPrice) > 1000 ? 4 : 2;
  const totalRequiredConnects = baseConnects + (isBoosted ? 5 : 0);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await apiClient.get("/wallet/balance");
      setConnectsBalance(res.data.connectsBalance || 0);
    } catch (err: any) {
      console.error("Failed to load technician wallet:", err.message);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await apiClient.get("/jobs");
      setJobs(response.data);
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

    // Local connects balance guard
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

      setConnectsBalance((prev) => prev - totalRequiredConnects);
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
    <SafeAreaView style={styles.safeArea}>
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
          <Feather name="zap" size={13} color="#0052CC" />
          <Text style={styles.connectsPillText}>
            {connectsBalance} Connects
          </Text>
          <Feather name="plus-circle" size={13} color="#0052CC" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
            placeholder="Search by issue, woreda, or sub-city..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={18} color="#94A3B8" />
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
                    <Feather name="map-pin" size={13} color="#64748B" />
                    <Text style={styles.metaText}>{item.subcity}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="clock" size={13} color="#94A3B8" />
                    <Text style={styles.metaText}>
                      {formatRelativeTime(item.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="user" size={13} color="#64748B" />
                    <Text style={styles.metaText}>
                      {item.customer?.fullName || "Verified Customer"}
                    </Text>
                  </View>
                  {item.photos && item.photos.length > 0 && (
                    <View style={styles.metaItem}>
                      <Feather name="image" size={13} color="#0052CC" />
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
                    <Feather name="message-square" size={14} color="#0052CC" />
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
                    <Feather name="send" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={44} color="#CBD5E1" />
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
                <Feather name="x" size={20} color="#64748B" />
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
                size={20}
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
              <Feather name="info" size={13} color="#64748B" />
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
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  connectsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectsPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0052CC",
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
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
  categoryPillsWrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  categoryPillsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  categoryPillActive: {
    backgroundColor: "#0052CC",
  },
  categoryPillText: {
    fontSize: 12,
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
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  listContent: {
    padding: 20,
    paddingBottom: 110,
  },
  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0052CC",
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  budgetAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },
  jobDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
  },
  metaDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  chatBtn: {
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
  chatBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0052CC",
  },
  detailsBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  quoteBtn: {
    flex: 1.3,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#0052CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  quoteBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    maxWidth: 260,
  },
  closeModalBtn: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  modalTextArea: {
    height: 70,
    paddingTop: 10,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
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
    fontSize: 11,
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
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 10,
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
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  boostBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0052CC",
  },
  boostSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15,
  },
  deductionSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  deductionText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
  boldText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  sendBidBtn: {
    height: 48,
    backgroundColor: "#0052CC",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  sendBidBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  sendBidBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
