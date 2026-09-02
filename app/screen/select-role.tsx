import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SelectRoleScreen() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<"provider" | "customer">(
    "provider",
  );

  const handleNext = () => {
    if (selectedRole === "provider") {
      router.push("/screen/service-provider/signup");
    } else {
      router.push("/screen/user/user-signup");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => router.replace("/screen/login")}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>I am</Text>
        </View>

        <View style={styles.cardList}>
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "provider"
                ? styles.cardActive
                : styles.cardInactive,
            ]}
            onPress={() => setSelectedRole("provider")}
            activeOpacity={0.8}
          >
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardTitle}>Service Provider</Text>
              <Text style={styles.cardSubtitle}>
                I offer professional services.
              </Text>
            </View>
            <View style={styles.iconWrapper}>
              {selectedRole === "provider" && (
                <Feather name="check" size={20} color="#0056B3" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "customer"
                ? styles.cardActive
                : styles.cardInactive,
            ]}
            onPress={() => setSelectedRole("customer")}
            activeOpacity={0.8}
          >
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardTitle}>Looking For Service</Text>
              <Text style={styles.cardSubtitle}>
                I am looking for home services.
              </Text>
            </View>
            <View style={styles.iconWrapper}>
              {selectedRole === "customer" && (
                <Feather name="check" size={20} color="#0056B3" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 52,
    fontWeight: "900",
    color: "#475569",
    letterSpacing: -1,
  },
  cardList: {
    flex: 1,
    gap: 16,
    marginTop: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  cardActive: {
    backgroundColor: "#E8F2FF",
    borderColor: "#0056B3",
  },
  cardInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#93C5FD",
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  iconWrapper: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  nextButton: {
    height: 52,
    backgroundColor: "#0056B3",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
