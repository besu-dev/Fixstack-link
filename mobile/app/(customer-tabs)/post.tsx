import React, { useState } from "react";
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
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", selectedCategory);
      formData.append("description", description.trim());
      formData.append("subcity", location.trim());
      formData.append("budget", budget.trim());
      formData.append("urgency", "Today");

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

      Alert.alert(
        "Task Published! 🎉",
        "Your service request has been broadcasted to verified technicians nearby.",
        [
          {
            text: "View Home",
            onPress: () => router.replace("/(customer-tabs)/home"),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "Failed to Post",
        err.response?.data?.message ||
          "Could not publish your job request. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post a Service Request</Text>
        <Text style={styles.headerSubtitle}>
          Get competitive quotes from certified technicians in minutes
        </Text>
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

        <TouchableOpacity
          style={styles.postBtn}
          onPress={handlePostTask}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.postBtnText}>Publish Job Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 14,
    marginBottom: 8,
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
  postBtn: {
    height: 50,
    backgroundColor: "#0052CC",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    elevation: 3,
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  postBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
