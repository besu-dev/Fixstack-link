import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import apiClient from "../../src/api/client";
import BuyConnectsModal from "../../components/BuyConnectsModal";
import { Alert } from "../../src/context/AlertContext";
import { useTheme } from "../../src/context/ThemeContext";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";

const CATEGORIES = [
  "Plumbing  and water system",
  "Electrical  and power",
  "Appliances & electronics",
  "carpentry & Metalwork",
  "Finshing and Cleaning",
]

export default function PostJobScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{
    preferredCategory?: string;
    preferredProviderId?: string;
    preferredProviderName?: string;
    serviceTitle?: string;
  }>();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState<"Today" | "Emergency">("Today");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Connects & Wallet State
  const [connectsBalance, setConnectsBalance] = useState<number>(0);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // 3 Base Connects, +5 extra for Emergency
  const connectsRequired = urgency === "Emergency" ? 8 : 3;

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await apiClient.get("/wallet/balance");
      setConnectsBalance(res.data.connectsBalance ?? 0);
    } catch {
      try {
        const userRes = await apiClient.get("/auth/me");
        const user = userRes.data?.user || userRes.data;
        if (user?.connectsBalance !== undefined) {
          setConnectsBalance(user.connectsBalance);
        }
      } catch (err) {
        console.error("Wallet balance fetch error:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  // Pre-fill form when arriving from "Request Service" on a provider or sub-service
  useEffect(() => {
    if (params?.serviceTitle) {
      setTitle(`Service Request: ${params.serviceTitle}`);
    }
    if (params?.preferredCategory) {
      const matched = CATEGORIES.find(
        (cat) =>
          cat.toLowerCase().includes(params.preferredCategory!.toLowerCase()) ||
          params.preferredCategory!.toLowerCase().includes(cat.toLowerCase())
      );
      if (matched) {
        setSelectedCategory(matched);
      }
    }
    if (params?.preferredProviderName) {
      setDescription(
        (prev) =>
          prev || `Preferred Technician: ${params.preferredProviderName}\n`
      );
    }
  }, [
    params?.preferredCategory,
    params?.preferredProviderName,
    params?.serviceTitle,
  ]);

  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert("Limit Reached", "You can only attach up to 3 photos.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera roll permissions are required to upload pictures."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePostTask = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please provide a short title for the job.");
      return;
    }
    if (!description.trim()) {
      Alert.alert(
        "Missing Description",
        "Please describe the repair or maintenance issue in detail."
      );
      return;
    }
    if (!location.trim()) {
      Alert.alert(
        "Missing Location",
        "Please specify your location or subcity so nearby technicians can find your request."
      );
      return;
    }

    // Connects verification check
    if (connectsBalance < connectsRequired) {
      Alert.alert(
        "Insufficient Connects",
        `You need ${connectsRequired} Connects to broadcast this request. Your current balance is ${connectsBalance} Connects.\n\nPlease top up your wallet to continue.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Top Up Now",
            onPress: () => setShowWalletModal(true),
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", selectedCategory);
      formData.append("description", description.trim());
      formData.append("subcity", location.trim());
      if (budget.trim()) {
        formData.append("budget", budget.trim());
      }
      formData.append("urgency", urgency);

      // Preferred technician assignment if booked from technician profile
      if (params?.preferredProviderId) {
        formData.append("preferredProviderId", params.preferredProviderId);
      }

      images.forEach((uri, idx) => {
        const filename = uri.split("/").pop() || `photo_${idx}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("photos", {
          uri,
          name: filename,
          type,
        } as any);
      });

      const response = await apiClient.post("/jobs/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedBalance = response.data?.newConnectsBalance;
      if (typeof updatedBalance === "number") {
        setConnectsBalance(updatedBalance);
      } else {
        setConnectsBalance((prev) => Math.max(0, prev - connectsRequired));
      }

      Alert.alert(
        "Request Posted! 🚀",
        "Your service request has been broadcasted to verified technicians. You will receive quotes shortly.",
        [
          {
            text: "View My Orders",
            onPress: () => router.push("/(customer-tabs)/orders"),
          },
        ]
      );

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setBudget("");
      setImages([]);
      setUrgency("Today");
    } catch (err: any) {
      console.error("Job posting error:", err.response?.data || err.message);
      const errMsg =
        err.response?.data?.message ||
        "Could not publish your service request. Please check your connection and try again.";
      Alert.alert("Posting Failed", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.canvas }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        backgroundColor={colors.surface}
      />

      {/* Screen Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Post a Service Request
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Broadcast to certified technicians in minutes
          </Text>
        </View>

        {/* Connects Balance Card */}
        <TouchableOpacity
          style={[
            styles.connectsPill,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowWalletModal(true)}
          activeOpacity={0.8}
        >
          <Feather
            name="zap"
            size={moderateScale(13)}
            color={colors.primary}
          />
          <Text
            style={[styles.connectsPillText, { color: colors.primary }]}
          >
            {connectsBalance} Connects
          </Text>
          <Feather
            name="plus-circle"
            size={moderateScale(13)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.canvas }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Job Title
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="e.g., Leaking kitchen sink pipe"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Select Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: isSelected ? "#FFFFFF" : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Describe the Issue
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Provide clear details (what happened, required materials, timing)..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          {/* Urgency Selection */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Priority / Urgency
          </Text>
          <View style={styles.urgencyRow}>
            {(["Today", "Emergency"] as const).map((level) => {
              const isSelected = urgency === level;
              const isEmergency = level === "Emergency";
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.urgencyPill,
                    {
                      backgroundColor: isSelected
                        ? isEmergency
                          ? colors.danger
                          : colors.primary
                        : isEmergency
                        ? colors.dangerLight
                        : colors.surface,
                      borderColor: isEmergency
                        ? colors.danger
                        : isSelected
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => setUrgency(level)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      {
                        color: isSelected
                          ? "#FFFFFF"
                          : isEmergency
                          ? colors.danger
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {isEmergency ? "🚨 Emergency (+5)" : level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Location / Subcity
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g., Bole"
                placeholderTextColor={colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.halfCol}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Budget (ETB)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g., 1000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={budget}
                onChangeText={setBudget}
              />
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Attach Photos (Optional)
          </Text>
          <View style={styles.attachmentRow}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeBadge}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Feather
                    name="x"
                    size={moderateScale(12)}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 3 && (
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <Feather
                  name="camera"
                  size={moderateScale(20)}
                  color={colors.primary}
                />
                <Text
                  style={[styles.uploadText, { color: colors.primary }]}
                >
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cost Summary Notice */}
          <View
            style={[
              styles.costSummary,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Feather
              name="info"
              size={moderateScale(14)}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.costSummaryText,
                { color: colors.textSecondary },
              ]}
            >
              Publishing this task will deduct{" "}
              <Text
                style={[styles.costHighlight, { color: colors.text }]}
              >
                {connectsRequired} Connects
              </Text>{" "}
              from your virtual wallet.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.postBtn,
              { backgroundColor: colors.primary },
              loading && styles.postBtnDisabled,
            ]}
            onPress={handlePostTask}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.postBtnText}>
                Publish Job Request ({connectsRequired} Connects)
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Buy Connects Modal */}
      <BuyConnectsModal
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        currentBalance={connectsBalance}
        onSuccess={(newBalance) => {
          setConnectsBalance(newBalance);
          setShowWalletModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingTop: scale(8),
    paddingBottom: scale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: scale(10),
  },
  headerTitle: {
    fontSize: scaledFont(18),
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
  scrollContainer: {
    paddingHorizontal: scale(20),
    paddingTop: scale(14),
    paddingBottom: scale(120),
  },
  label: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#1E293B",
    marginTop: scale(14),
    marginBottom: scale(6),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: scale(46),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(14),
    fontSize: scaledFont(13),
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: scale(95),
    paddingTop: scale(10),
  },
  categoryRow: {
    flexDirection: "row",
    gap: scale(8),
    paddingBottom: scale(4),
  },
  categoryPill: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(7),
    borderRadius: moderateScale(20),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  categoryPillActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  categoryText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#475569",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  urgencyPill: {
    flex: 1,
    paddingVertical: scale(9),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  urgencyPillActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  urgencyEmergency: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  urgencyEmergencyActive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  urgencyEmergencyText: {
    color: "#DC2626",
  },
  urgencyText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#475569",
  },
  urgencyTextActive: {
    color: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    gap: scale(12),
  },
  halfCol: {
    flex: 1,
  },
  attachmentRow: {
    flexDirection: "row",
    gap: scale(12),
    alignItems: "center",
    marginTop: scale(4),
  },
  uploadBox: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(10),
    borderWidth: 1.5,
    borderColor: "#0052CC",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    gap: scale(4),
  },
  uploadText: {
    fontSize: scaledFont(10),
    fontWeight: "600",
    color: "#0052CC",
  },
  imagePreviewWrapper: {
    position: "relative",
  },
  imagePreview: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(10),
  },
  removeBadge: {
    position: "absolute",
    top: scale(-6),
    right: scale(-6),
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  costSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    backgroundColor: "#F1F5F9",
    borderRadius: moderateScale(8),
    padding: scale(10),
    marginTop: scale(16),
  },
  costSummaryText: {
    fontSize: scaledFont(11),
    color: "#64748B",
    flex: 1,
    lineHeight: scaledFont(16),
  },
  costHighlight: {
    fontWeight: "700",
    color: "#0F172A",
  },
  postBtn: {
    height: scale(48),
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(20),
    elevation: 2,
  },
  postBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  postBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
});
