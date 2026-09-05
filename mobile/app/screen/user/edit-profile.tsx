import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../../src/api/client";

export default function EditProfileScreen() {
  const router = useRouter();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing profile from cache or backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const user = res.data;
        setFullName(user.fullName || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phone || "");
        setAddress(user.subcity || "");
        if (user.avatarUrl) setAvatarUri(user.avatarUrl);
      } catch {
        const cached = await SecureStore.getItemAsync("user_data");
        if (cached) {
          const user = JSON.parse(cached);
          setFullName(user.fullName || "");
          setEmail(user.email || "");
          setPhoneNumber(user.phone || "");
          setAddress(user.subcity || "");
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
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
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

      if (avatarUri && !avatarUri.startsWith("http")) {
        const filename = avatarUri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("avatar", {
          uri: avatarUri,
          name: filename,
          type,
        } as any);
      }

      const res = await apiClient.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update local storage so ProfileScreen reflects changes immediately
      if (res.data?.user) {
        await SecureStore.setItemAsync(
          "user_data",
          JSON.stringify(res.data.user),
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
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require("../../../assets/images/Furniture.jpg")
              }
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
            >
              <Feather name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Profile Picture</Text>
          </TouchableOpacity>
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

          <Text style={styles.label}>Home Address / Subcity</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Bole Sub-city, Addis Ababa"
            placeholderTextColor="#94A3B8"
          />

          {/* Submit Button */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E2E8F0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0052CC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0052CC",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 14,
    marginBottom: 6,
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
  readOnlyInput: {
    backgroundColor: "#F8FAFC",
    color: "#64748B",
  },
  saveBtn: {
    height: 50,
    backgroundColor: "#0052CC",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    elevation: 3,
    shadowColor: "#0052CC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
