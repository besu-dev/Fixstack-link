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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../../src/api/client";

export default function CustomerSignupScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !password.trim()
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (!agreed) {
      Alert.alert(
        "User Agreement",
        "Please accept the User Agreement and Privacy Policy.",
      );
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const cleanEmail = email.trim().toLowerCase();

      const payload: Record<string, any> = {
        fullName,
        phone: phone.trim().replace(/[\s\-()]/g, ""),
        password,
        role: "customer",
      };

      // Only attach email if user actually entered one
      if (cleanEmail) {
        payload.email = cleanEmail;
      }

      const response = await apiClient.post("/auth/register", payload);

      const { token, user } = response.data;
      await SecureStore.setItemAsync("user_token", token);
      await SecureStore.setItemAsync("user_role", user.role);
      await SecureStore.setItemAsync("user_data", JSON.stringify(user));

      router.replace("/(customer-tabs)/home");
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        err.response?.data?.message ||
          "Could not complete registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/screen/select-role")}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoBox}>
              <View style={styles.orangeCircle} />
              <FontAwesome5
                name="wrench"
                size={26}
                color="#0052CC"
                style={{ transform: [{ rotate: "-30deg" }] }}
              />
            </View>
            <Text style={styles.brandTitle}>FixLink</Text>
            <Text style={styles.screenTitle}>Create new account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.halfCol}>
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

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0911223344 or +251 9..."
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Text style={styles.label}>Email Address (Optional)</Text>
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
            <View style={styles.passwordBox}>
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
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordBox}>
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
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                onPress={() => setAgreed(!agreed)}
                style={[styles.checkbox, agreed && styles.checkboxChecked]}
                activeOpacity={0.8}
              >
                {agreed && <Feather name="check" size={12} color="#FFFFFF" />}
              </TouchableOpacity>
              <Text style={styles.agreementText}>
                I’ve read and agreed to{" "}
                <Text style={styles.blueText}>User Agreement</Text> and{" "}
                <Text style={styles.blueText}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  backText: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  header: { alignItems: "center", marginBottom: 24 },
  logoBox: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  orangeCircle: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: "#F97316",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#002B49",
    marginTop: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 8,
  },
  form: { width: "100%" },
  row: { flexDirection: "row", gap: 12 },
  halfCol: { flex: 1 },
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
    backgroundColor: "#FFFFFF",
  },
  passwordBox: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: { flex: 1, fontSize: 14, color: "#0F172A" },
  eyeBtn: { padding: 4 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 20,
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
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  agreementText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18 },
  blueText: { color: "#2563EB", fontWeight: "600" },
  btn: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  footerText: { fontSize: 13, color: "#64748B" },
  footerLink: { fontSize: 13, fontWeight: "700", color: "#0052CC" },
});
