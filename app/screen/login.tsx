import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSignIn = () => {
    if (!agreed) {
      Alert.alert(
        "Agreement required",
        "Please accept the User Agreement and Privacy Policy.",
      );
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <View style={styles.orangeArc} />
              <FontAwesome5
                name="wrench"
                size={28}
                color="#0052CC"
                style={{ transform: [{ rotate: "-30deg" }] }}
              />
            </View>
            <Text style={styles.brandTitle}>Welcome to FixLink 👋</Text>
            <Text style={styles.subtitle}>
              Connect with certified technicians in minutes
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <View style={styles.passWrapper}>
              <TextInput
                style={styles.passInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push("/screen/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                onPress={() => setAgreed((p) => !p)}
                style={styles.checkboxTouch}
              >
                <View
                  style={[styles.checkbox, agreed && styles.checkboxActive]}
                >
                  {agreed && <Feather name="check" size={12} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>
              <Text style={styles.agreementText}>
                I’ve read and agreed to{" "}
                <Text style={styles.linkText}>User Agreement</Text> and{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleSignIn}
              activeOpacity={0.85}
            >
              <Text style={styles.signInBtnText}>Sign in</Text>
            </TouchableOpacity>

            <Text style={styles.otherText}>other way to sign in</Text>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialCircle}>
                <Image
                  source={require("../../assets/SVG/google.svg")}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialCircle}>
                <Image
                  source={require("../../assets/SVG/facebook.svg")}
                  resizeMode="contain"
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/screen/select-role")}
            >
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "space-between",
    flexGrow: 1,
  },
  header: { alignItems: "center", marginTop: 24, marginBottom: 24 },
  logoMark: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  orangeArc: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "#F97316",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  form: { width: "100%" },
  label: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1E293B",
  },
  passWrapper: { position: "relative", justifyContent: "center" },
  passInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingLeft: 14,
    paddingRight: 44,
    fontSize: 14,
    color: "#1E293B",
  },
  eyeBtn: { position: "absolute", right: 14 },
  forgotBtn: { alignSelf: "flex-end", marginTop: 8, marginBottom: 18 },
  forgotText: { fontSize: 13, color: "#475569", fontWeight: "500" },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  checkboxTouch: { marginRight: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  agreementText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18 },
  linkText: { color: "#2563EB", fontWeight: "600" },
  signInBtn: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  signInBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  otherText: {
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    marginTop: 24,
    marginBottom: 16,
  },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: { width: 26, height: 26 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: { fontSize: 13, color: "#64748B" },
  footerLink: { fontSize: 13, fontWeight: "700", color: "#0052CC" },
});
