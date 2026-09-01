import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const handleSignup = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !selectedValue
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    Alert.alert("Success", "Account created successfully!", [
      {
        text: "Login",
        onPress: () => router.replace("/login"),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/image.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>FixLink</Text>

          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <Text style={styles.label}>First Name</Text>

            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.nameField}>
            <Text style={styles.label}>Last Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text style={styles.label}>Confirm Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select your Service</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={(itemValue) => setSelectedValue(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select your profession" value="" />

              <Picker.Item label="Plumbing" value="plumbing" />

              <Picker.Item label="Electrical" value="electrical" />

              <Picker.Item
                label="Water pump repair"
                value="water_pump_repair"
              />

              <Picker.Item label="House cleaning" value="house_cleaning" />

              <Picker.Item label="Appliance repair" value="appliance_repair" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
          activeOpacity={0.8}
        >
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>

          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },

  headerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
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

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },

  nameRow: {
    flexDirection: "row",
    gap: 10,
  },

  nameField: {
    flex: 1,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#909193",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  inputGroup: {
    marginBottom: 18,
  },

  pickerContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: "#909193",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    overflow: "hidden",
  },

  picker: {
    height: 55,
    color: "#1F2937",
  },

  signupButton: {
    height: 55,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  signupText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  loginText: {
    color: "#666",
    fontSize: 15,
  },

  loginLink: {
    color: "#2196F3",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 5,
  },
});
