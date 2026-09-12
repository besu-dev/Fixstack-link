import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Job } from "../../src/types";
import { jobsApi } from "../../src/api";
import { Alert } from "../../src/context/AlertContext";
import { useTheme } from "../../src/context/ThemeContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  job: Job | null;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  job,
  onReviewSubmitted,
}) => {
  const { colors, isDark } = useTheme();
  const [starCount, setStarCount] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (visible) {
      setStarCount(5);
      setReviewComment("");
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!job) return;

    setSubmittingReview(true);
    try {
      await jobsApi.submitReview(job._id, {
        rating: starCount,
        reviewText: reviewComment.trim(),
      });

      Alert.alert("Thank You! 🌟", "Your rating and feedback have been saved.");
      onClose();
      onReviewSubmitted();
    } catch (err: any) {
      Alert.alert(
        "Failed to Submit",
        err.response?.data?.message || "Could not save review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStarLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return "Excellent service!";
      case 4:
        return "Good work!";
      case 3:
        return "Average repair";
      case 2:
        return "Poor experience";
      default:
        return "Needs improvement";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Rate Your Experience
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {job?.assignedProvider?.fullName || "Technician"} • {job?.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Feather
                name="x"
                size={moderateScale(20)}
                color={colors.textSecondary}
              />
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
                  color={star <= starCount ? "#F59E0B" : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text
            style={[
              styles.starRatingNotice,
              { color: colors.text },
            ]}
          >
            {getStarLabel(starCount)}
          </Text>

          {/* Feedback Input */}
          <Text
            style={[
              styles.reviewLabel,
              { color: colors.textSecondary },
            ]}
          >
            Leave a Review (Optional)
          </Text>
          <TextInput
            style={[
              styles.reviewInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Was the provider punctual, polite, and thorough?"
            placeholderTextColor={colors.textMuted}
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
            onPress={handleSubmit}
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
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    padding: scale(20),
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  modalTitle: {
    fontSize: scaledFont(17),
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
    maxWidth: scale(240),
  },
  closeBtn: {
    padding: scale(6),
  },
  starSelectionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(14),
    marginVertical: scale(12),
  },
  starTouchArea: {
    padding: scale(4),
  },
  starRatingNotice: {
    textAlign: "center",
    fontSize: scaledFont(13),
    fontWeight: "600",
    color: "#F59E0B",
    marginBottom: scale(16),
  },
  reviewLabel: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#334155",
    marginBottom: scale(6),
  },
  reviewInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: scale(12),
    padding: scale(12),
    fontSize: scaledFont(13),
    color: "#0F172A",
    minHeight: scale(80),
    marginBottom: scale(20),
  },
  submitReviewBtn: {
    backgroundColor: "#0052CC",
    borderRadius: scale(12),
    paddingVertical: scale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitReviewBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
});

export default ReviewModal;
