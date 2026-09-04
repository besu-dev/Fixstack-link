import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../../src/api/client";

interface AttachedDoc {
  uri: string;
  name: string;
  type: string;
}

export default function UploadDocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [kebeleDoc, setKebeleDoc] = useState<AttachedDoc | null>(null);
  const [certDoc, setCertDoc] = useState<AttachedDoc | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickKebeleId = async () => {
    Alert.alert("Upload Kebele ID", "Choose source", [
      {
        text: "Take Photo",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission needed", "Camera access is required.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setKebeleDoc({
              uri: asset.uri,
              name: "kebele_id.jpg",
              type: "image/jpeg",
            });
          }
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          });
          if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setKebeleDoc({
              uri: asset.uri,
              name: asset.fileName || "kebele_id.jpg",
              type: asset.mimeType || "image/jpeg",
            });
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickTradeCert = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const file = res.assets[0];
        setCertDoc({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        });
      }
    } catch {
      Alert.alert("Error", "Could not attach file.");
    }
  };

  const handleFinalSubmit = async () => {
    if (!kebeleDoc) {
      Alert.alert(
        "Required Document",
        "Please attach your Kebele ID / National ID for identity verification.",
      );
      return;
    }
    if (!agreed) {
      Alert.alert("Agreement Required", "Please accept the FixLink Pro Terms.");
      return;
    }

    setLoading(true);
    try {
      const fullName =
        `${params.firstName || ""} ${params.lastName || ""}`.trim();
      const rawPhone = (params.phone as string) || "";
      const cleanPhone = rawPhone.replace(/[\s\-()]/g, "");
      const cleanEmail = (params.email as string)?.trim().toLowerCase();

      // Submit as FormData to allow file attachments
      const formData = new FormData();
      formData.append("fullName", fullName || "Service Provider");
      formData.append("phone", cleanPhone);
      formData.append("password", params.password as string);
      formData.append("role", "provider");
      formData.append(
        "profession",
        (params.service as string) || "General Technician",
      );
      formData.append("subcity", (params.location as string) || "Bole");
      formData.append(
        "serviceRadius",
        (params.serviceRadius as string) || "15 km",
      );

      if (cleanEmail) {
        formData.append("email", cleanEmail);
      }

      // Attach file
      formData.append("kebeleId", {
        uri: kebeleDoc.uri,
        name: kebeleDoc.name,
        type: kebeleDoc.type,
      } as any);

      if (certDoc) {
        formData.append("tradeCert", {
          uri: certDoc.uri,
          name: certDoc.name,
          type: certDoc.type,
        } as any);
      }

      const response = await apiClient.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { token, user } = response.data;
      await SecureStore.setItemAsync("user_token", token);
      await SecureStore.setItemAsync("user_role", user.role);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));

      Alert.alert(
        "Application Submitted",
        "Welcome to FixLink Pro! Your documents are submitted for verification.",
        [
          {
            text: "Go to Job Feed",
            onPress: () => router.replace("/(provider-tabs)/jobs"),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        err.response?.data?.message || "Could not complete registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.brandHeader}>
          <View style={styles.logoMark}>
            <View style={styles.orangeArc} />
            <FontAwesome5
              name="wrench"
              size={26}
              color="#0052CC"
              style={styles.wrenchIcon}
            />
          </View>
          <Text style={styles.brandName}>FixLink</Text>
          <Text style={styles.pageTitle}>Verification Documents</Text>
          <Text style={styles.subtitleText}>
            Upload credentials to earn the Verified Technician badge
          </Text>
        </View>

        {/* Kebele ID Box */}
        <Text style={styles.sectionLabel}>
          1. Kebele ID / National Digital ID *
        </Text>
        <TouchableOpacity
          style={[styles.uploadBox, kebeleDoc && styles.uploadBoxDone]}
          onPress={pickKebeleId}
          activeOpacity={0.8}
        >
          <Feather
            name={kebeleDoc ? "check-circle" : "upload-cloud"}
            size={28}
            color={kebeleDoc ? "#16A34A" : "#0052CC"}
          />
          <Text style={styles.uploadTitle} numberOfLines={1}>
            {kebeleDoc ? kebeleDoc.name : "Tap to browse or take photo"}
          </Text>
          <Text style={styles.uploadMeta}>
            {kebeleDoc ? "File ready to upload" : "PNG, JPG or PDF (Max 5MB)"}
          </Text>
        </TouchableOpacity>

        {/* Trade Certificate Box */}
        <Text style={[styles.sectionLabel, styles.fieldSpacing]}>
          2. TVET / Trade Certificate (Optional)
        </Text>
        <TouchableOpacity
          style={[styles.uploadBox, certDoc && styles.uploadBoxDone]}
          onPress={pickTradeCert}
          activeOpacity={0.8}
        >
          <Feather
            name={certDoc ? "check-circle" : "file-text"}
            size={28}
            color={certDoc ? "#16A34A" : "#64748B"}
          />
          <Text style={styles.uploadTitle} numberOfLines={1}>
            {certDoc ? certDoc.name : "Tap to upload trade license"}
          </Text>
          <Text style={styles.uploadMeta}>
            {certDoc
              ? "Certificate selected"
              : "Boosts profile ranking in bids"}
          </Text>
        </TouchableOpacity>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={[styles.checkbox, agreed && styles.checkboxChecked]}
            activeOpacity={0.8}
          >
            {agreed && <Feather name="check" size={12} color="#FFFFFF" />}
          </TouchableOpacity>
          <Text style={styles.agreementText}>
            I confirm that the submitted identification belongs to me and all
            details are accurate under Ethiopian civil law.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleFinalSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 36 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  backText: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  brandHeader: { alignItems: "center", marginBottom: 24 },
  logoMark: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  orangeArc: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: "#F97316",
  },
  wrenchIcon: { transform: [{ rotate: "-30deg" }] },
  brandName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#002B49",
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 6,
  },
  subtitleText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    marginTop: 10,
  },
  fieldSpacing: { marginTop: 16 },
  uploadBox: {
    height: 110,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  uploadBoxDone: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  uploadMeta: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  agreementText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18 },
  submitButton: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    elevation: 2,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
