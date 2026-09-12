import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../../src/api/client";
import { Alert } from "../../../src/context/AlertContext";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../../src/utils/responsive";
import UserAvatar from "../../../components/common/UserAvatar";

export default function EditProfileScreen() {
  const router = useRouter();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPicked, setAvatarPicked] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing profile from backend or local cache
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const user = res.data?.user || res.data;
        if (user) {
          setFullName(user.fullName || "");
          setEmail(user.email || "");
          setPhoneNumber(user.phone || "");
          setAddress(user.subcity || user.location || user.address || "");
          if (user.avatarUrl) setAvatarUri(user.avatarUrl);
        }
      } catch {
        const cached = await SecureStore.getItemAsync("user_data");
        if (cached) {
          const user = JSON.parse(cached);
          setFullName(user.fullName || "");
          setEmail(user.email || "");
          setPhoneNumber(user.phone || "");
          setAddress(user.subcity || user.location || user.address || "");
          if (user.avatarUrl) setAvatarUri(user.avatarUrl);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Photo library access is needed to update your profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
      setAvatarPicked(true);
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUri(null);
    setAvatarPicked(false);
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Missing Field", "Please provide your full name.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("phone", phoneNumber.trim());
      formData.append("subcity", address.trim());
      formData.append("location", address.trim());

      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      } else if (avatarPicked && avatarUri) {
        const filename = avatarUri.split("/").pop() || "customer_avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("avatar", {
          uri: avatarUri,
          name: filename,
          type,
        } as any);
      }

      const res = await apiClient.put("/auth/profile", formData);

      // Update local storage so CustomerProfileScreen updates immediately
      const updatedUser = res.data?.user || res.data;
      if (updatedUser) {
        await SecureStore.setItemAsync(
          "user_data",
          JSON.stringify(updatedUser),
        );
      }

      Alert.alert("Success", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err.response?.data?.message || "Could not save profile changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#0052CC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={moderateScale(22)} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <UserAvatar
                avatarUrl={avatarUri}
                name={fullName || "Customer"}
                size={moderateScale(90)}
              />
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                <Feather
                  name="camera"
                  size={moderateScale(13)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.photoActionsRow}>
              <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
                <Text style={styles.changePhotoText}>
                  {avatarUri ? "Change Profile Picture" : "Add Profile Picture"}
                </Text>
              </TouchableOpacity>
              {avatarUri ? (
                <>
                  <Text style={styles.actionDot}>•</Text>
                  <TouchableOpacity onPress={handleRemoveAvatar} activeOpacity={0.7}>
                    <Text style={styles.removePhotoText}>Remove</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Alex Tefera"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Email Address (Read-Only)</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={email}
              editable={false}
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="+251 91 234 5678"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Location / Subcity</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g., Bole, Addis Ababa"
              placeholderTextColor="#94A3B8"
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
  },
  placeholder: {
    width: moderateScale(30),
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: scale(18),
    paddingBottom: scale(40),
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: scale(20),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: scale(10),
  },
  avatar: {
    width: moderateScale(92),
    height: moderateScale(92),
    borderRadius: moderateScale(46),
    backgroundColor: "#E2E8F0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: scale(2),
    right: scale(2),
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  photoActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  changePhotoText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
  actionDot: {
    fontSize: scaledFont(12),
    color: "#94A3B8",
  },
  removePhotoText: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#DC2626",
  },
  form: {
    width: "100%",
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
  readOnlyInput: {
    backgroundColor: "#F8FAFC",
    color: "#64748B",
    borderColor: "#E2E8F0",
  },
  saveBtn: {
    height: scale(48),
    backgroundColor: "#0052CC",
    borderRadius: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(28),
    elevation: 3,
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
});
