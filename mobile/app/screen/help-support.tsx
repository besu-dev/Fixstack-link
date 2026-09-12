import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import HelpSupportSection, { UserRole } from "../../components/common/HelpSupportSection";
import { useTheme } from "../../src/context/ThemeContext";

export default function HelpSupportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>("customer");
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    const resolveRole = async () => {
      if (params.role === "provider" || params.role === "customer") {
        setRole(params.role as UserRole);
        setLoading(false);
        return;
      }
      try {
        const storedRole = await SecureStore.getItemAsync("user_role");
        if (storedRole === "provider") {
          setRole("provider");
        } else {
          setRole("customer");
        }
      } catch {
        setRole("customer");
      } finally {
        setLoading(false);
      }
    };

    resolveRole();
  }, [params.role]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.canvas }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={["top", "bottom"]}>
      <HelpSupportSection
        role={role}
        onBack={() => router.back()}
        showHeader={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
