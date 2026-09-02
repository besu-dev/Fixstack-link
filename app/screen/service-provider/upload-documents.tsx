import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function UploadDocumentsScreen() {
  const router = useRouter();

  const [tvetDoc, setTvetDoc] = useState<string | null>(null);
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handlePickDocument = async (type: "tvet" | "id") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Photo library access is needed to upload documents.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (type === "tvet") {
        setTvetDoc(uri);
      } else {
        setIdDoc(uri);
      }
    }
  };

  const handleNext = () => {
    if (!tvetDoc || !idDoc) {
      Alert.alert(
        "Documents Required",
        "Please upload both your TVET/COC Certificate and ID.",
      );
      return;
    }

    if (!agreed) {
      Alert.alert(
        "Terms Required",
        "Please accept the User Agreement and Privacy Policy.",
      );
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/screen/service-provider/signup1")}
          >
            <Feather name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.heading}>We need a few Documents.</Text>

          <Text style={styles.label}>Upload your TVET / COC Certificate</Text>
          <TouchableOpacity
            style={[styles.uploadBox, tvetDoc ? styles.uploadBoxDone : null]}
            onPress={() => handlePickDocument("tvet")}
          >
            <Feather
              name={tvetDoc ? "check" : "plus"}
              size={20}
              color="#0056B3"
            />
            <Text style={styles.uploadText} numberOfLines={1}>
              {tvetDoc ? "Certificate Uploaded" : "Upload"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.label, styles.fieldSpacing]}>
            Upload your Id
          </Text>
          <TouchableOpacity
            style={[styles.uploadBox, idDoc ? styles.uploadBoxDone : null]}
            onPress={() => handlePickDocument("id")}
          >
            <Feather
              name={idDoc ? "check" : "plus"}
              size={20}
              color="#0056B3"
            />
            <Text style={styles.uploadText} numberOfLines={1}>
              {idDoc ? "ID Uploaded" : "Upload"}
            </Text>
          </TouchableOpacity>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              style={[styles.checkbox, agreed && styles.checkboxActive]}
            >
              {agreed && <Feather name="check" size={12} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              I’ve read and agreed to{" "}
              <Text style={styles.linkText}>User Agreement</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Register</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 36,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 28,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    marginBottom: 10,
  },
  fieldSpacing: {
    marginTop: 24,
  },
  uploadBox: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#0056B3",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  uploadBoxDone: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0056B3",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 10,
  },
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
  checkboxActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  nextButton: {
    height: 54,
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
