import React, { useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
  
      router.replace("/screen/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerBox}>
        <View style={styles.iconContainer}>
          <View style={styles.orangeCircleOutline} />
          <View style={styles.blueWrenchBox}>
            <FontAwesome5
              name="wrench"
              size={44}
              color="#0052CC"
              style={styles.wrenchIcon}
            />
          </View>
        </View>

        <View style={styles.brandRow}>
          <Text style={styles.brandPrimary}>Fix</Text>
          <Text style={styles.brandSecondary}>Link</Text>
        </View>

        <View style={styles.taglineRow}>
          <View style={styles.dash} />
          <Text style={styles.tagline}>
            <Text style={styles.tagBlue}>Connect. </Text>
            <Text style={styles.tagOrange}>Fix. </Text>
            <Text style={styles.tagDark}>Done.</Text>
          </Text>
          <View style={styles.dash} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: { alignItems: "center" },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  orangeCircleOutline: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 6,
    borderColor: "#F97316",
  },
  blueWrenchBox: { position: "absolute" },
  wrenchIcon: { transform: [{ rotate: "-30deg" }] },
  brandRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  brandPrimary: {
    fontSize: 44,
    fontWeight: "900",
    color: "#002B49",
    letterSpacing: -0.5,
  },
  brandSecondary: {
    fontSize: 44,
    fontWeight: "900",
    color: "#0052CC",
    letterSpacing: -0.5,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  dash: { width: 24, height: 2, backgroundColor: "#002B49" },
  tagline: { fontSize: 13, fontWeight: "700" },
  tagBlue: { color: "#0052CC" },
  tagOrange: { color: "#F97316" },
  tagDark: { color: "#002B49" },
});
