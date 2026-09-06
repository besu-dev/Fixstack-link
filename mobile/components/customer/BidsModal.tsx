import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Job, BidItem } from "../../src/types";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

interface BidsModalProps {
  visible: boolean;
  onClose: () => void;
  job: Job | null;
  bids: BidItem[];
  loading: boolean;
  acceptingBidId: string | null;
  onAcceptBid: (bid: BidItem) => void;
  onChat: (bid: BidItem) => void;
}

export const BidsModal: React.FC<BidsModalProps> = ({
  visible,
  onClose,
  job,
  bids,
  loading,
  acceptingBidId,
  onAcceptBid,
  onChat,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Technician Proposals</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                {job?.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={moderateScale(20)} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#0052CC" />
              <Text style={styles.loadingText}>Loading quotes...</Text>
            </View>
          ) : bids.length === 0 ? (
            <View style={styles.emptyModalBox}>
              <Feather name="users" size={moderateScale(38)} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Quotes Yet</Text>
              <Text style={styles.emptySubtitle}>
                Certified technicians are reviewing your job request. Proposals
                will show here automatically.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.proposalsList}
            >
              {bids.map((bid) => {
                const isAccepted = bid.status === "accepted";

                return (
                  <View
                    key={bid._id}
                    style={[styles.bidCard, bid.isBoosted && styles.bidCardBoosted]}
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
                        onPress={() => onChat(bid)}
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
                        onPress={() => onAcceptBid(bid)}
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
  );
};

const styles = StyleSheet.create({
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
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: scale(50),
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  emptyModalBox: { alignItems: "center", paddingVertical: scale(40) },
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
});

export default BidsModal;
