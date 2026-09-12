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
import { useTheme } from "../../../src/context/ThemeContext";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../../src/utils/responsive";
import UserAvatar from "../../../components/common/UserAvatar";

const PROFESSIONS = [
  "Plumbing  and water system",
  "Electrical  and power",
  "Appliances & electronics",
  "carpentry & Metalwork",
  "Finshing and Cleaning",

];

const EXPERIENCE_LEVELS = ["< 1 year", "1-3 yrs", "3-5 yrs", "5+ yrs"];

export default function ProviderEditProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarPicked, setAvatarPicked] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profession, setProfession] = useState("Plumbing");
  const [subcity, setSubcity] = useState("");
  const [experience, setExperience] = useState("1-3 yrs");

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const user = res.data?.user || res.data;
        if (user) {
          setFullName(user.fullName || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          if (user.profession) setProfession(user.profession);
          if (user.subcity) setSubcity(user.subcity);
          if (user.experience) setExperience(user.experience);
          if (user.avatarUrl) setAvatarUri(user.avatarUrl);
        }
      } catch {
        const cached = await SecureStore.getItemAsync("user_data");
        if (cached) {
          const user = JSON.parse(cached);
          setFullName(user.fullName || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          if (user.profession) setProfession(user.profession);
          if (user.subcity) setSubcity(user.subcity);
          if (user.experience) setExperience(user.experience);
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
        "Photo library access is needed to change your profile picture.",
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
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Missing Phone", "Please enter your contact phone number.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("phone", phone.trim());
      formData.append("profession", profession);
      formData.append("subcity", subcity.trim());
      formData.append("experience", experience);

      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      } else if (avatarPicked && avatarUri) {
        const filename = avatarUri.split("/").pop() || "provider_avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("avatar", {
          uri: avatarUri,
          name: filename,
          type,
        } as any);
      }

      const res = await apiClient.put("/auth/profile", formData);

      const updatedUser = res.data?.user || res.data;
      if (updatedUser) {
        await SecureStore.setItemAsync(
          "user_data",
          JSON.stringify(updatedUser),
        );
      }

      Alert.alert(
        "Profile Updated 🎉",
        "Your technician credentials have been saved.",
        [{ text: "OK", onPress: () => router.back() }],
      );
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
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.canvas }]} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      {/* Screen Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={moderateScale(22)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Provider Profile</Text>
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
                name={fullName || "Provider"}
                size={moderateScale(92)}
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
                <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                  {avatarUri ? "Change Profile Picture" : "Add Profile Picture"}
                </Text>
              </TouchableOpacity>
              {avatarUri ? (
                <>
                  <Text style={[styles.actionDot, { color: colors.textMuted }]}>•</Text>
                  <TouchableOpacity onPress={handleRemoveAvatar} activeOpacity={0.7}>
                    <Text style={styles.removePhotoText}>Remove</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g., Besufikad Getaye"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+251 91 123 4567"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                styles.readOnlyInput,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.cardBorder,
                  color: colors.textSecondary,
                },
              ]}
              value={email}
              editable={false}
              placeholder="Email Address"
              placeholderTextColor={colors.textMuted}
            />

            {/* Primary Profession Selection */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Primary Skills</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {PROFESSIONS.map((item) => {
                const isSelected = profession === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.cardBorder,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setProfession(item)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.textSecondary },
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Location / Subcity Input Field */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Location / Subcity</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.text }]}
              value={subcity}
              onChangeText={setSubcity}
              placeholder="e.g., Bole, Addis Ababa"
              placeholderTextColor={colors.textMuted}
            />

            {/* Years of Experience */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Years of Experience</Text>
            <View style={styles.experienceRow}>
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = experience === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.expChip,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.cardBorder,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setExperience(level)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.expText,
                        { color: colors.textSecondary },
                        isSelected && styles.expTextSelected,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
    paddingTop: scale(16),
    paddingBottom: scale(40),
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: scale(18),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: scale(8),
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
  chipsRow: {
    flexDirection: "row",
    gap: scale(8),
    paddingBottom: scale(4),
  },
  chip: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: moderateScale(20),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  chipSelected: {
    backgroundColor: "#0052CC",
    borderColor: "#0052CC",
  },
  chipText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#475569",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  experienceRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  expChip: {
    flex: 1,
    paddingVertical: scale(9),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  expChipSelected: {
    borderColor: "#0052CC",
    backgroundColor: "#EFF6FF",
  },
  expText: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#64748B",
  },
  expTextSelected: {
    color: "#0052CC",
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
