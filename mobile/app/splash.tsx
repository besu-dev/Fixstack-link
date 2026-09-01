import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),

        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      
      Animated.delay(1000),
    ]).start(() => {
      router.replace("/login");
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/image.png")}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
          },
        ]}
      >
        Mobile
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: textOpacity,
          },
        ]}
      >
        Welcome to our app
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  logo: {
    width: 150,
    height: 150,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 20,
  },

  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 8,
  },
});
