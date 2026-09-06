import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Job } from "../../src/types";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

interface OrderCardProps {
  job: Job;
  onViewQuotes: (job: Job) => void;
  onChat: (job: Job) => void;
  onComplete: (job: Job) => void;
  onRate: (job: Job) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  job,
  onViewQuotes,
  onChat,
  onComplete,
  onRate,
}) => {
  const isAssigned = job.status === "assigned";
  const isCompleted = job.status === "completed";
  const isCancelled = job.status === "cancelled";

  // Extract review data safely from multiple possible backend formats
  const reviewComment =
    typeof job.review === "string"
      ? job.review
      : typeof job.review === "object" && job.review
      ? job.review.comment
      : job.reviewDetails?.comment || "";

  const reviewRating =
    job.rating ||
    (typeof job.review === "object" && job.review ? job.review.rating : null) ||
    job.reviewDetails?.rating ||
    null;

  const isReviewed = Boolean(reviewRating || reviewComment || job.isReviewed);

  return (
    <View style={styles.orderCard}>
      {/* Header Info */}
      <View style={styles.orderCardHeader}>
        <View style={styles.pillRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{job.category}</Text>
          </View>

          {/* Status Pill */}
          <View
            style={[
              styles.statusPill,
              isAssigned
                ? styles.statusAssigned
                : isCompleted
                ? styles.statusCompleted
                : isCancelled
                ? styles.statusCancelled
                : styles.statusOpen,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isAssigned
                  ? styles.statusTextAssigned
                  : isCompleted
                  ? styles.statusTextCompleted
                  : isCancelled
                  ? styles.statusTextCancelled
                  : styles.statusTextOpen,
              ]}
            >
              {job.status.toUpperCase()}
            </Text>
          </View>

          {/* Review Status Pill for Completed Orders */}
          {isCompleted && (
            <View
              style={[
                styles.reviewStatusPill,
                isReviewed ? styles.pillReviewed : styles.pillPendingReview,
              ]}
            >
              <FontAwesome
                name={isReviewed ? "star" : "clock-o"}
                size={moderateScale(10)}
                color={isReviewed ? "#16A34A" : "#D97706"}
              />
              <Text
                style={[
                  styles.reviewStatusText,
                  isReviewed
                    ? styles.reviewStatusTextReviewed
                    : styles.reviewStatusTextPending,
                ]}
              >
                {isReviewed ? "REVIEWED" : "PENDING REVIEW"}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.budgetAmount}>{job.budget} ETB</Text>
      </View>

      <Text style={styles.jobTitle}>{job.title}</Text>
      <Text style={styles.jobDescription} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.locationRow}>
        <Feather name="map-pin" size={moderateScale(12)} color="#64748B" />
        <Text style={styles.locationText}>{job.subcity}</Text>
      </View>

      {/* Card Footer Actions */}
      <View style={styles.cardFooter}>
        {/* ASSIGNED STATE: Provider assigned, in-progress */}
        {isAssigned && job.assignedProvider ? (
          <View style={styles.assignedContainer}>
            <View style={styles.providerInfo}>
              <Feather name="tool" size={moderateScale(14)} color="#0052CC" />
              <Text style={styles.assignedProName} numberOfLines={1}>
                {job.assignedProvider.fullName}
              </Text>
            </View>

            <View style={styles.assignedActionsRow}>
              <TouchableOpacity
                style={styles.chatProBtn}
                onPress={() => onChat(job)}
              >
                <Feather
                  name="message-square"
                  size={moderateScale(13)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => onComplete(job)}
                activeOpacity={0.85}
              >
                <Feather
                  name="check"
                  size={moderateScale(13)}
                  color="#FFFFFF"
                />
                <Text style={styles.completeBtnText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isCompleted ? (
          /* COMPLETED STATE: Shows reviews, ratings, and rating button */
          <View style={styles.completedContainer}>
            <View style={styles.completedHeaderRow}>
              <View style={styles.providerInfo}>
                <Feather name="user-check" size={moderateScale(14)} color="#16A34A" />
                <Text style={styles.completedNotice} numberOfLines={1}>
                  Completed by {job.assignedProvider?.fullName || "Technician"}
                </Text>
              </View>

              {/* Chat action if provider exists */}
              {job.assignedProvider && (
                <TouchableOpacity
                  style={styles.chatHistoryBtn}
                  onPress={() => onChat(job)}
                >
                  <Feather
                    name="message-circle"
                    size={moderateScale(14)}
                    color="#0052CC"
                  />
                  <Text style={styles.chatHistoryText}>Chat</Text>
                </TouchableOpacity>
              )}
            </View>

            {isReviewed ? (
              /* ORDER HAS BEEN REVIEWED: Show Star Rating & Specific Feedback */
              <View style={styles.reviewBox}>
                <View style={styles.reviewBoxHeader}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FontAwesome
                        key={s}
                        name={s <= (reviewRating || 5) ? "star" : "star-o"}
                        size={moderateScale(13)}
                        color="#F59E0B"
                      />
                    ))}
                    <Text style={styles.ratingScoreText}>
                      {reviewRating ? `${Number(reviewRating).toFixed(1)} / 5.0` : "5.0 / 5.0"}
                    </Text>
                  </View>
                  <View style={styles.verifiedReviewBadge}>
                    <Feather name="check" size={moderateScale(10)} color="#15803D" />
                    <Text style={styles.verifiedReviewText}>Order Verified</Text>
                  </View>
                </View>

                {reviewComment ? (
                  <Text style={styles.reviewCommentText}>
                    "{reviewComment}"
                  </Text>
                ) : (
                  <Text style={styles.noCommentText}>
                    Service rated {reviewRating || 5}.0 stars
                  </Text>
                )}
              </View>
            ) : (
              /* NOT REVIEWED YET: Prompt customer to rate this specific order */
              <View style={styles.pendingReviewBox}>
                <View style={styles.pendingNoticeRow}>
                  <Text style={styles.pendingReviewNotice}>
                    How was the service provided for this order?
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.rateNowBtn}
                  onPress={() => onRate(job)}
                  activeOpacity={0.85}
                >
                  <FontAwesome
                    name="star"
                    size={moderateScale(13)}
                    color="#FFFFFF"
                  />
                  <Text style={styles.rateNowText}>Rate & Review Service</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* OPEN STATE: View quotes from technicians */
          <TouchableOpacity
            style={styles.viewQuotesBtn}
            onPress={() => onViewQuotes(job)}
            activeOpacity={0.85}
          >
            <Feather
              name="file-text"
              size={moderateScale(14)}
              color="#0052CC"
            />
            <Text style={styles.viewQuotesBtnText}>View Quotes & Proposals</Text>
            <Feather
              name="chevron-right"
              size={moderateScale(16)}
              color="#0052CC"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(14),
    padding: scale(14),
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
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    flexWrap: "wrap",
    flex: 1,
  },
  categoryPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  categoryPillText: {
    color: "#0052CC",
    fontSize: scaledFont(10),
    fontWeight: "700",
  },
  statusPill: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  statusOpen: { backgroundColor: "#FEF3C7" },
  statusAssigned: { backgroundColor: "#E0E7FF" },
  statusCompleted: { backgroundColor: "#DCFCE7" },
  statusCancelled: { backgroundColor: "#F1F5F9" },
  statusText: { fontSize: scaledFont(9), fontWeight: "800" },
  statusTextOpen: { color: "#D97706" },
  statusTextAssigned: { color: "#4338CA" },
  statusTextCompleted: { color: "#15803D" },
  statusTextCancelled: { color: "#64748B" },

  reviewStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(7),
    paddingVertical: scale(3),
    borderRadius: moderateScale(6),
  },
  pillReviewed: {
    backgroundColor: "#DCFCE7",
  },
  pillPendingReview: {
    backgroundColor: "#FEF3C7",
  },
  reviewStatusText: {
    fontSize: scaledFont(9),
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  reviewStatusTextReviewed: {
    color: "#15803D",
  },
  reviewStatusTextPending: {
    color: "#D97706",
  },

  budgetAmount: {
    fontSize: scaledFont(14),
    fontWeight: "800",
    color: "#0F172A",
  },
  jobTitle: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: scale(4),
  },
  jobDescription: {
    fontSize: scaledFont(12),
    color: "#64748B",
    lineHeight: scale(16),
    marginBottom: scale(8),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    marginBottom: scale(12),
  },
  locationText: {
    fontSize: scaledFont(11),
    color: "#64748B",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: scale(10),
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
    maxWidth: scale(170),
  },
  assignedActionsRow: { flexDirection: "row", gap: scale(8) },
  chatProBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(8),
    backgroundColor: "#0052CC",
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

  // Completed Container & Review Box
  completedContainer: {
    gap: scale(8),
  },
  completedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  completedNotice: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  chatHistoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: moderateScale(6),
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  chatHistoryText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#0052CC",
  },

  reviewBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(10),
    padding: scale(10),
    marginTop: scale(2),
  },
  reviewBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(4),
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
  },
  ratingScoreText: {
    fontSize: scaledFont(12),
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: scale(4),
  },
  verifiedReviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(3),
    backgroundColor: "#DCFCE7",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: moderateScale(4),
  },
  verifiedReviewText: {
    fontSize: scaledFont(9),
    fontWeight: "700",
    color: "#15803D",
  },
  reviewCommentText: {
    fontSize: scaledFont(12),
    color: "#334155",
    fontStyle: "italic",
    lineHeight: scale(16),
  },
  noCommentText: {
    fontSize: scaledFont(11),
    color: "#64748B",
    fontStyle: "italic",
  },

  // Pending Review Box (Prompt to rate)
  pendingReviewBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: moderateScale(10),
    padding: scale(10),
    gap: scale(8),
  },
  pendingNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingReviewNotice: {
    fontSize: scaledFont(11),
    color: "#92400E",
    fontWeight: "600",
  },
  rateNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
    backgroundColor: "#0052CC",
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
  },
  rateNowText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  viewQuotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    paddingVertical: scale(10),
    paddingHorizontal: scale(14),
    borderRadius: moderateScale(8),
  },
  viewQuotesBtnText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
});

export default OrderCard;
