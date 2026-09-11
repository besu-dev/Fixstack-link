import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "../../../src/context/AlertContext";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../../src/utils/responsive";
import UserAvatar from "../../../components/common/UserAvatar";

export default function ProviderSignupStep1() {
  const router = useRouter();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Photo library access is needed to select a profile picture.",
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
    }
  };

  const handleContinue = () => {
    if (!avatarUri) {
      Alert.alert(
        "Profile Picture Required",
        "Please upload a clear profile photo. Service providers must have an identifiable photo for client trust and verification.",
      );
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // Forward sanitized credentials to Step 2
    router.push({
      pathname: "/screen/service-provider/signup1",
      params: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatarUri: avatarUri || "",
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/screen/select-role")}
            activeOpacity={0.7}
          >
            <Feather
              name="chevron-left"
              size={moderateScale(22)}
              color="#0F172A"
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.brandHeader}>
            <Image
              source={require("../../../assets/images/logos/bete_logo_mark.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Bete</Text>
            <Text style={styles.pageTitle}>Provider Account (Step 1/3)</Text>
          </View>

          <View style={styles.form}>
            {/* Profile Picture Picker Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <UserAvatar
                  avatarUrl={avatarUri}
                  name={firstName.trim() ? `${firstName.trim()} ${lastName.trim()}` : "Provider"}
                  size={moderateScale(86)}
                  onPress={handlePickAvatar}
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
              <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
                <Text style={styles.avatarActionText}>
                  {avatarUri ? "Change Profile Picture" : "Add Profile Picture (Required)"}
                  {!avatarUri && <Text style={styles.requiredStar}> </Text>}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nameRow}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={moderateScale(18)}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={moderateScale(18)}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace("/screen/login")}>
                <Text style={styles.footerLink}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
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
  scrollContainer: {
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    paddingBottom: scale(36),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: scale(4),
    paddingVertical: scale(6),
    paddingRight: scale(16),
    marginBottom: scale(6),
  },
  backText: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#0F172A",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: scale(20),
  },
  brandLogo: {
    width: moderateScale(56),
    height: moderateScale(56),
    marginBottom: scale(4),
  },
  brandName: {
    fontSize: scaledFont(19),
    fontWeight: "800",
    color: "#0F172A",
    marginTop: scale(2),
  },
  pageTitle: {
    fontSize: scaledFont(19),
    fontWeight: "700",
    color: "#2563EB",
    marginTop: scale(6),
  },
  avatarSection: {
    alignItems: "center",
    marginTop: scale(4),
    marginBottom: scale(14),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: scale(8),
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 2,
  },
  avatarActionText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#2563EB",
  },
  requiredStar: {
    color: "#EF4444",
    fontWeight: "700",
  },
  form: {
    width: "100%",
  },
  nameRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  halfInputContainer: {
    flex: 1,
  },
  label: {
    fontSize: scaledFont(11),
    fontWeight: "700",
    color: "#1E293B",
    marginTop: scale(12),
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
  passwordWrapper: {
    height: scale(46),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    fontSize: scaledFont(13),
    color: "#0F172A",
  },
  eyeIcon: {
    padding: scale(4),
  },
  continueButton: {
    height: scale(48),
    backgroundColor: "#2563EB",
    borderRadius: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(24),
    elevation: 3,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: scaledFont(14),
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(20),
  },
  footerText: {
    fontSize: scaledFont(12),
    color: "#64748B",
  },
  footerLink: {
    fontSize: scaledFont(12),
    fontWeight: "700",
    color: "#0052CC",
  },
});
