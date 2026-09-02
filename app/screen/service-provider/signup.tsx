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
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CustomerSignupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    router.replace("/screen/service-provider/signup1");
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/screen/select-role")}
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
              style={{ transform: [{ rotate: "-30deg" }] }}
            />
          </View>
          <Text style={styles.brandName}>FixLink</Text>
          <Text style={styles.pageTitle}>Create new account</Text>
        </View>

        <View style={styles.form}>
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
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your confirm password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Feather
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace("/screen/service-provider/signup1")}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>other way to sign in</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require("../../../assets/SVG/google.svg")}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require("../../../assets/SVG/facebook.svg")}
                resizeMode="contain"
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/screen/login")}>
              <Text style={styles.footerLink}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
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
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfInputContainer: {
    flex: 1,
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
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  passwordWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  eyeIcon: {
    padding: 4,
  },
  continueButton: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    marginTop: 18,
    marginBottom: 14,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 26,
    height: 26,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0052CC",
  },
});
