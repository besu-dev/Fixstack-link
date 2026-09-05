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
  Modal,
} from "react-native";
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

  const [modalVisible, setModalVisible] = useState(false);
  const [activeDocType, setActiveDocType] = useState<"kebele" | "tradeCert">(
    "kebele",
  );

  const openPickerModal = (type: "kebele" | "tradeCert") => {
    setActiveDocType(type);
    setModalVisible(true);
  };

  const handlePickImage = async (mode: "camera" | "gallery") => {
    setModalVisible(false);

    let result;
    if (mode === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera access is required.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery access is required.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
    }

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const selectedFile: AttachedDoc = {
        uri: asset.uri,
        name: asset.fileName || `${activeDocType}_upload.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      if (activeDocType === "kebele") {
        setKebeleDoc(selectedFile);
      } else {
        setCertDoc(selectedFile);
      }
    }
  };

  const handlePickDocument = async () => {
    setModalVisible(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets?.[0]) {
        const file = res.assets[0];
        const selectedFile: AttachedDoc = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        };

        if (activeDocType === "kebele") {
          setKebeleDoc(selectedFile);
        } else {
          setCertDoc(selectedFile);
        }
      }
    } catch {
      Alert.alert("Error", "Could not attach document.");
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
        `${params.firstName || ""} ${params.lastName || ""}`.trim() ||
        (params.fullName as string) ||
        "Service Provider";
      const rawPhone = (params.phone as string) || "";
      const cleanPhone = rawPhone.replace(/[\s\-()]/g, "");
      const cleanEmail = (params.email as string)?.trim().toLowerCase();

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", cleanPhone);
      formData.append("password", (params.password as string) || "");
      formData.append("role", "provider");
      formData.append(
        "profession",
        (params.profession as string) ||
          (params.service as string) ||
          "General Maintenance",
      );
      formData.append(
        "subcity",
        (params.location as string) || (params.subcity as string) || "Bole",
      );
      formData.append(
        "experience",
        (params.experience as string) || "1 - 3 years",
      );
      formData.append("skills", (params.skills as string) || "[]");

      if (cleanEmail) {
        formData.append("email", cleanEmail);
      }

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
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.brandHeader}>
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
          style={[styles.uploadBox, kebeleDoc ? styles.uploadBoxDone : null]}
          onPress={() => openPickerModal("kebele")}
          activeOpacity={0.8}
        >
          {kebeleDoc ? (
            <View style={styles.uploadedState}>
              <Text style={styles.doneBadge}>✓ Attached</Text>
              <Text style={styles.uploadTitle} numberOfLines={1}>
                {kebeleDoc.name}
              </Text>
              <Text style={styles.changeText}>Tap to change file</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.uploadActionText}>Tap to upload ID</Text>
              <Text style={styles.uploadMeta}>PNG, JPG or PDF (Max 5MB)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Trade Certificate Box */}
        <Text style={[styles.sectionLabel, styles.fieldSpacing]}>
          2. TVET / Trade Certificate (Optional)
        </Text>
        <TouchableOpacity
          style={[styles.uploadBox, certDoc ? styles.uploadBoxDone : null]}
          onPress={() => openPickerModal("tradeCert")}
          activeOpacity={0.8}
        >
          {certDoc ? (
            <View style={styles.uploadedState}>
              <Text style={styles.doneBadge}>✓ Attached</Text>
              <Text style={styles.uploadTitle} numberOfLines={1}>
                {certDoc.name}
              </Text>
              <Text style={styles.changeText}>Tap to change file</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.uploadActionText}>
                Tap to upload trade license
              </Text>
              <Text style={styles.uploadMeta}>
                Boosts profile ranking in bids
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={[styles.checkbox, agreed ? styles.checkboxChecked : null]}
            activeOpacity={0.8}
          >
            {agreed ? <Text style={styles.checkText}>✓</Text> : null}
          </TouchableOpacity>
          <Text style={styles.agreementText}>
            I confirm that the submitted identification belongs to me and all
            details are accurate under Ethiopian civil law.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            loading ? styles.submitButtonDisabled : null,
          ]}
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

      {/* Upload Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {activeDocType === "kebele"
                  ? "Attach Kebele / ID"
                  : "Attach Certificate"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => handlePickImage("camera")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionTitle}>Take Photo</Text>
              <Text style={styles.actionSub}>
                Capture document using camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => handlePickImage("gallery")}
              activeOpacity={0.7}
            >
              <Text style={styles.actionTitle}>Choose from Gallery</Text>
              <Text style={styles.actionSub}>
                Select photo from device gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={handlePickDocument}
              activeOpacity={0.7}
            >
              <Text style={styles.actionTitle}>Select PDF or File</Text>
              <Text style={styles.actionSub}>Browse files and documents</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  backButton: { paddingVertical: 6, marginBottom: 8 },
  backText: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
  brandHeader: { alignItems: "center", marginBottom: 24 },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#002B49",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 4,
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
    minHeight: 110,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  uploadBoxDone: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  emptyState: { alignItems: "center" },
  uploadActionText: { fontSize: 14, fontWeight: "700", color: "#2563EB" },
  uploadMeta: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  uploadedState: { alignItems: "center" },
  doneBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: 10,
    textAlign: "center",
  },
  changeText: { fontSize: 11, color: "#64748B", marginTop: 4 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  agreementText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18 },
  submitButton: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    elevation: 2,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  // Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeBtnText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  sheetAction: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  actionSub: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
