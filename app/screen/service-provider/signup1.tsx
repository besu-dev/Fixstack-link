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

export default function ProviderSignupScreen() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [serviceRadius, setServiceRadius] = useState("");

  const handleRegister = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Missing Field", "Please enter your phone number.");
      return;
    }

    router.push("/screen/upload-documents" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/screen/service-provider/signup")}
          activeOpacity={0.7}
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
              style={styles.wrenchIcon}
            />
          </View>
          <Text style={styles.brandName}>FixLink</Text>
          <Text style={styles.pageTitle}>Create new account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+251 91 234 5678"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={[styles.label, styles.fieldSpacing]}>
            Select Your service
          </Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert("Select Service", "Choose your profession", [
                { text: "Plumbing", onPress: () => setService("Plumbing") },
                { text: "Electrical", onPress: () => setService("Electrical") },
                {
                  text: "Solar Technician",
                  onPress: () => setService("Solar Technician"),
                },
                {
                  text: "Air Conditioning",
                  onPress: () => setService("Air Conditioning"),
                },
                { text: "Cancel", style: "cancel" },
              ]);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !service && styles.dropdownPlaceholder,
              ]}
            >
              {service || "Select profession (e.g., Plumbing, Electrical)"}
            </Text>
            <Feather name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>

          <Text style={[styles.label, styles.fieldSpacing]}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Addis Ababa (Bole)"
            placeholderTextColor="#94A3B8"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={[styles.label, styles.fieldSpacing]}>
            Service Radius
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Up to 25 km"
            placeholderTextColor="#94A3B8"
            value={serviceRadius}
            onChangeText={setServiceRadius}
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() =>
              router.replace("/screen/service-provider/upload-documents")
            }
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>Continue</Text>
          </TouchableOpacity>

          <Text style={styles.dividerText}>other way to sign in</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Image
                source={require("../../../assets/SVG/google.svg")}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <Image
                source={require("../../../assets/SVG/facebook.svg")}
                resizeMode="contain"
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.replace("/screen/login")}
              activeOpacity={0.7}
            >
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  socialIcon: {
    width: 26,
    height: 26,
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
  wrenchIcon: {
    transform: [{ rotate: "-30deg" }],
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  fieldSpacing: {
    marginTop: 14,
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
  dropdownBox: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 14,
    color: "#0F172A",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#94A3B8",
  },
  registerButton: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    elevation: 2,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerButtonText: {
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
    backgroundColor: "#FFFFFF",
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
