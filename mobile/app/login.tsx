import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";

import { router } from "expo-router";

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/image.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>FixLink</Text>

          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Do not have an account?</Text>
          

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.registerButton}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#777",
    marginTop: 8,
    marginBottom: 35,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fafafa",
  },

  loginButton: {
    height: 55,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  loginText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  forgotPassword: {
    textAlign: "center",
    color: "#2196F3",
    marginTop: 18,
    fontSize: 15,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },

  registerText: {
    color: "#666",
    fontSize: 15,
  },

  registerButton: {
    color: "#2196F3",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
