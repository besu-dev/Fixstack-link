import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../../src/api/client";
import { Alert } from "../../../src/context/AlertContext";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../../src/utils/responsive";
import UserAvatar from "../../../components/common/UserAvatar";

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

      if (params.avatarUri) {
        const avatarUri = params.avatarUri as string;
        const filename = avatarUri.split("/").pop() || "provider_avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("avatar", {
          uri: avatarUri,
          name: filename,
          type,
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
      if (err.response?.data?.message) {
        Alert.alert("Registration Failed", err.response.data.message);
      } else {
        Alert.alert(
          "Network Error",
          "Unable to connect to the server. Please verify your connection and that the backend is running.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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

        {params.avatarUri ? (
          <View style={styles.avatarPreviewBanner}>
            <UserAvatar
              avatarUrl={params.avatarUri as string}
              name={(params.firstName as string) || "Provider"}
              size={moderateScale(46)}
            />
            <View style={styles.avatarPreviewInfo}>
              <Text style={styles.avatarPreviewTitle}>Profile Photo Attached</Text>
              <Text style={styles.avatarPreviewSub}>
                Will be stored securely on Cloudinary
              </Text>
            </View>
            <View style={styles.avatarCheckBadge}>
              <Text style={styles.avatarCheckText}>✓</Text>
            </View>
          </View>
        ) : null}

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
  scrollContainer: {
    paddingHorizontal: scale(24),
    paddingTop: scale(16),
    paddingBottom: scale(40),
  },
  backButton: { paddingVertical: scale(6), marginBottom: scale(8) },
  backText: { fontSize: scaledFont(15), fontWeight: "700", color: "#2563EB" },
  brandHeader: { alignItems: "center", marginBottom: scale(24) },
  brandName: {
    fontSize: scaledFont(22),
    fontWeight: "800",
    color: "#002B49",
  },
  pageTitle: {
    fontSize: scaledFont(18),
    fontWeight: "700",
    color: "#2563EB",
    marginTop: scale(4),
  },
  subtitleText: {
    fontSize: scaledFont(13),
    color: "#64748B",
    textAlign: "center",
    marginTop: scale(4),
  },
  avatarPreviewBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    marginBottom: scale(12),
    gap: scale(12),
  },
  avatarPreviewInfo: {
    flex: 1,
  },
  avatarPreviewTitle: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#166534",
  },
  avatarPreviewSub: {
    fontSize: scaledFont(11),
    color: "#15803D",
    marginTop: 2,
  },
  avatarCheckBadge: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCheckText: {
    color: "#FFFFFF",
    fontSize: scaledFont(12),
    fontWeight: "800",
  },
  sectionLabel: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: scale(8),
    marginTop: scale(10),
  },
  fieldSpacing: { marginTop: scale(16) },
  uploadBox: {
    minHeight: scale(110),
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(12),
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(16),
  },
  uploadBoxDone: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  emptyState: { alignItems: "center" },
  uploadActionText: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#2563EB",
  },
  uploadMeta: {
    fontSize: scaledFont(11),
    color: "#94A3B8",
    marginTop: scale(4),
  },
  uploadedState: { alignItems: "center" },
  doneBadge: {
    fontSize: scaledFont(12),
    fontWeight: "800",
    color: "#16A34A",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: scale(10),
    paddingVertical: scale(3),
    borderRadius: moderateScale(12),
    marginBottom: scale(6),
  },
  uploadTitle: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: scale(10),
    textAlign: "center",
  },
  changeText: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginTop: scale(4),
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(22),
    gap: scale(10),
  },
  checkbox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(4),
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
    fontSize: scaledFont(13),
    fontWeight: "800",
  },
  agreementText: {
    flex: 1,
    fontSize: scaledFont(12),
    color: "#475569",
    lineHeight: scaledFont(18),
  },
  submitButton: {
    height: scale(48),
    backgroundColor: "#2563EB",
    borderRadius: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(26),
    elevation: 2,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: scaledFont(15),
    fontWeight: "700",
  },

  // Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    paddingBottom: scale(36),
  },
  sheetHandle: {
    width: scale(36),
    height: scale(4),
    borderRadius: moderateScale(2),
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: scale(14),
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
    paddingBottom: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sheetTitle: { fontSize: scaledFont(16), fontWeight: "800", color: "#0F172A" },
  closeBtn: { paddingVertical: scale(4), paddingHorizontal: scale(8) },
  closeBtnText: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#64748B",
  },
  sheetAction: {
    paddingVertical: scale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(10),
    backgroundColor: "#F8FAFC",
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionTitle: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
  },
  actionSub: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
});
