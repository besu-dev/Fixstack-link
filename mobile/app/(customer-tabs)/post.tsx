import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import apiClient from "../../src/api/client";
import BuyConnectsModal from "../../components/BuyConnectsModal";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Solar Technician",
  "Air Conditioning",
  "Appliances & Mitad",
  "Gate & Metalwork",
  "General Maintenance",
];

export default function PostJobScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Plumbing");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState<"Today" | "Emergency" | "Flexible">(
    "Today",
  );
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
      setConnectsBalance(res.data.connectsBalance || 0);
    } catch (err) {
      console.error("Wallet balance error:", err);
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert(
        "Limit Reached",
        "You can upload up to 3 photos of the issue.",
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to attach photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostTask = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !budget.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill in title, description, location, and budget.",
      );
      return;
    }

    // Client-side connects check
    if (connectsBalance < connectsRequired) {
      setShowWalletModal(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", selectedCategory);
      formData.append("description", description.trim());
      formData.append("subcity", location.trim());
      formData.append("budget", budget.trim());
      formData.append("urgency", urgency);

      images.forEach((uri, index) => {
        const filename = uri.split("/").pop() || `issue_photo_${index}.jpg`;
        formData.append("photos", {
          uri,
          name: filename,
          type: "image/jpeg",
        } as any);
      });

      await apiClient.post("/jobs", formData, {
        headers: { Accept: "application/json" },
        transformRequest: (data) => data,
      });

      setConnectsBalance((prev) => prev - connectsRequired);

      Alert.alert(
        "Task Published! 🎉",
        `Broadcasted to certified technicians. (${connectsRequired} Connects used)`,
        [
          {
            text: "View Orders",
            onPress: () => router.replace("/(customer-tabs)/orders"),
          },
        ],
      );
    } catch (err: any) {
      if (err.response?.status === 402) {
        setShowWalletModal(true);
      } else {
        Alert.alert(
          "Failed to Post",
          err.response?.data?.message ||
            "Could not publish your job request. Try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Post a Service Request</Text>
          <Text style={styles.headerSubtitle}>
            Broadcast to certified technicians in minutes
          </Text>
        </View>

        {/* Connects Balance Card */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Leaking kitchen sink pipe"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Select Category</Text>
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
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Describe the Issue</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Provide clear details (what happened, required materials, timing)..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {/* Urgency Selection */}
        <Text style={styles.label}>Priority / Urgency</Text>
        <View style={styles.urgencyRow}>
          {(["Flexible", "Today", "Emergency"] as const).map((level) => {
            const isSelected = urgency === level;
            const isEmergency = level === "Emergency";
            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyPill,
                  isSelected && styles.urgencyPillActive,
                  isEmergency && styles.urgencyEmergency,
                  isEmergency && isSelected && styles.urgencyEmergencyActive,
                ]}
                onPress={() => setUrgency(level)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    isSelected && styles.urgencyTextActive,
                    isEmergency && !isSelected && styles.urgencyEmergencyText,
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
            <Text style={styles.label}>Location / Subcity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bole"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.halfCol}>
            <Text style={styles.label}>Budget (ETB)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
          </View>
        </View>

        <Text style={styles.label}>Attach Photos (Optional)</Text>
        <View style={styles.attachmentRow}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeBadge}
                onPress={() => handleRemoveImage(index)}
              >
                <Feather name="x" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 3 && (
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <Feather name="camera" size={20} color="#0052CC" />
              <Text style={styles.uploadText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cost Summary Notice */}
        <View style={styles.costSummary}>
          <Feather name="info" size={14} color="#64748B" />
          <Text style={styles.costSummaryText}>
            Publishing this task will deduct{" "}
            <Text style={styles.costHighlight}>
              {connectsRequired} Connects
            </Text>{" "}
            from your virtual wallet.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.postBtn}
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

      {/* Buy Connects Modal */}
      <BuyConnectsModal
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        currentBalance={connectsBalance}
        onSuccess={(newBalance) => setConnectsBalance(newBalance)}
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
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 20,
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 14,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  categoryPillActive: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 8,
  },
  urgencyPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
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
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  urgencyTextActive: {
    color: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  attachmentRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 4,
  },
  uploadBox: {
    width: 85,
    height: 85,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#0052CC",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    gap: 4,
  },
  uploadText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0052CC",
  },
  imagePreviewWrapper: {
    position: "relative",
  },
  imagePreview: {
    width: 85,
    height: 85,
    borderRadius: 10,
  },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  costSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
  },
  costSummaryText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
  costHighlight: {
    fontWeight: "700",
    color: "#0F172A",
  },
  postBtn: {
    height: 50,
    backgroundColor: "#0052CC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    elevation: 2,
  },
  postBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
