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
import { Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

  const handleRegister = () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!agreed) {
      Alert.alert("Error", "Please accept the agreement");
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/screen/select-role")}
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
            placeholder="+251 91 234 5678"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

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
            >
              {agreed && <Feather name="check" size={12} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I’ve read and agreed to{" "}
              <Text style={styles.blueText}>User Agreement</Text> and{" "}
              <Text style={styles.blueText}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister}>
            <Text style={styles.btnText}>Register</Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>other way to sign in</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Image
                source={require("../../../assets/SVG/google.svg")}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Image
                source={require("../../../assets/SVG/facebook.svg")}
                resizeMode="contain"
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
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
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
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
  form: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
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
  passwordBox: {
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
  eyeBtn: {
    padding: 4,
  },
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
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },
  blueText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  btn: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
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
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialBtn: {
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
  footer: {
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
