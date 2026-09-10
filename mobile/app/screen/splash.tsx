import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Animated,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Smooth fade & scale in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    let timer: ReturnType<typeof setTimeout>;
    const checkDestination = async () => {
      try {
        const token = await SecureStore.getItemAsync("user_token");
        const role = await SecureStore.getItemAsync("user_role");
        timer = setTimeout(() => {
          if (token && role) {
            if (role === "provider") {
              router.replace("/(provider-tabs)/jobs");
            } else {
              router.replace("/(customer-tabs)/home");
            }
          } else {
            router.replace("/screen/login");
          }
        }, 2200);
      } catch {
        timer = setTimeout(() => {
          router.replace("/screen/login");
        }, 2200);
      }
    };

    checkDestination();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, router]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View
        style={[
          styles.centerBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/images/logos/bete_logo_stacked.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
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
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 290,
    height: 320,
  },
});


