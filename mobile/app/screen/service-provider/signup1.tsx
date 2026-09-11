import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "../../../src/context/AlertContext";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../../src/utils/responsive";

const SERVICE_TAXONOMY: Record<string, string[]> = {
  "Plumbing & Water Systems": [
    "Tanker Pump",
    "Pipe Leak",
    "Water Heater",
    "Bathroom Fit",
  ],
  "Electrical & Power": [
    "House Wiring",
  ],
  "Appliances & Electronics": [
    "Washing Machine",
    "Refrigerator",
    "TV & Satellite",
    "Electric Stove",
  ],
  "Carpentry & Metalwork": [
    "Compound Gate",
    "Lock & Key",
    "Furniture",
    "Roof Sheet",
  ],
  "Finishing & Cleaning": [
    "Wall Painting",
    "Tile Repair",
    "Deep Cleaning",
    "Moving & Loading",
  ],
};

const EXPERIENCE_LEVELS = [
  "Less than 1 year",
  "1 - 3 years",
  "3 - 5 years",
  "5 - 10 years",
  "10+ years",
];

export default function ProviderSignupStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubSkills([]);
    setCategoryModalVisible(false);
  };

  const toggleSubSkill = (skill: string) => {
    if (selectedSubSkills.includes(skill)) {
      setSelectedSubSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setSelectedSubSkills((prev) => [...prev, skill]);
    }
  };

  const handleContinue = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Missing Field", "Please enter your phone number.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Missing Field", "Please choose your main service trade.");
      return;
    }
    if (selectedSubSkills.length === 0) {
      Alert.alert(
        "Select Skills",
        "Please choose at least one specific service specialization.",
      );
      return;
    }
    if (!location.trim()) {
      Alert.alert(
        "Missing Field",
        "Please enter your base location / subcity.",
      );
      return;
    }
    if (!experience) {
      Alert.alert("Missing Field", "Please select your years of experience.");
      return;
    }

    router.push({
      pathname: "/screen/service-provider/upload-documents",
      params: {
        ...params,
        phone: phoneNumber.trim().replace(/[\s\-()]/g, ""),
        profession: selectedCategory,
        skills: JSON.stringify(selectedSubSkills),
        location: location.trim(),
        experience,
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.brandHeader}>
            <Image
              source={require("../../../assets/images/logos/bete_logo_mark.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>Bete</Text>
            <Text style={styles.pageTitle}>Service Details (Step 2/3)</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="0911223344 or +251 9..."
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            <Text style={[styles.label, styles.fieldSpacing]}>
              Primary Trade / Category
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownBox,
                selectedCategory ? styles.dropdownBoxActive : null,
              ]}
              activeOpacity={0.8}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedCategory ? styles.dropdownPlaceholder : null,
                ]}
                numberOfLines={1}
              >
                {selectedCategory || "Select primary trade..."}
              </Text>
              <Text style={styles.dropdownIndicator}>▼</Text>
            </TouchableOpacity>

            {selectedCategory ? (
              <View style={styles.fieldSpacing}>
                <View style={styles.subSkillHeader}>
                  <Text style={styles.label}>Specific Services You Offer</Text>
                  <Text style={styles.subLabel}>Tap to select multiple</Text>
                </View>
                <View style={styles.pillWrap}>
                  {SERVICE_TAXONOMY[selectedCategory].map((subSkill) => {
                    const isSelected = selectedSubSkills.includes(subSkill);
                    return (
                      <TouchableOpacity
                        key={subSkill}
                        style={[
                          styles.skillPill,
                          isSelected ? styles.skillPillActive : null,
                        ]}
                        onPress={() => toggleSubSkill(subSkill)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.skillPillText,
                            isSelected ? styles.skillPillTextActive : null,
                          ]}
                        >
                          {isSelected ? `✓ ${subSkill}` : `+ ${subSkill}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Text style={[styles.label, styles.fieldSpacing]}>
              Base Location / Subcity
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Addis Ababa (Bole)"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={[styles.label, styles.fieldSpacing]}>
              Work Experience
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownBox,
                experience ? styles.dropdownBoxActive : null,
              ]}
              activeOpacity={0.8}
              onPress={() => setExperienceModalVisible(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !experience ? styles.dropdownPlaceholder : null,
                ]}
                numberOfLines={1}
              >
                {experience || "Select years of experience..."}
              </Text>
              <Text style={styles.dropdownIndicator}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.registerButtonText}>
                Continue to Documents
              </Text>
            </TouchableOpacity>

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
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Your Primary Trade</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {Object.keys(SERVICE_TAXONOMY).map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      isSelected ? styles.categoryOptionSelected : null,
                    ]}
                    onPress={() => handleSelectCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected ? styles.categoryOptionTextActive : null,
                      ]}
                    >
                      {cat}
                    </Text>
                    {isSelected ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Experience Selection Modal */}
      <Modal
        visible={experienceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExperienceModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setExperienceModalVisible(false)}
        >
          <View
            style={styles.modalSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Experience Level</Text>
              <TouchableOpacity
                onPress={() => setExperienceModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {EXPERIENCE_LEVELS.map((level) => {
                const isSelected = experience === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.categoryOption,
                      isSelected ? styles.categoryOptionSelected : null,
                    ]}
                    onPress={() => {
                      setExperience(level);
                      setExperienceModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        isSelected ? styles.categoryOptionTextActive : null,
                      ]}
                    >
                      {level}
                    </Text>
                    {isSelected ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: scale(24),
    paddingTop: scale(16),
    paddingBottom: scale(40),
  },
  backButton: {
    paddingVertical: scale(6),
    marginBottom: scale(8),
  },
  backText: {
    fontSize: scaledFont(15),
    fontWeight: "700",
    color: "#2563EB",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: scale(20),
  },
  brandLogo: {
    width: moderateScale(48),
    height: moderateScale(48),
    marginBottom: scale(4),
  },
  brandName: {
    fontSize: scaledFont(20),
    fontWeight: "800",
    color: "#0F172A",
  },
  pageTitle: {
    fontSize: scaledFont(18),
    fontWeight: "700",
    color: "#2563EB",
    marginTop: scale(4),
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: scale(6),
  },
  subLabel: {
    fontSize: scaledFont(11),
    color: "#64748B",
    marginBottom: scale(6),
  },
  subSkillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldSpacing: {
    marginTop: scale(14),
  },
  input: {
    height: scale(48),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(14),
    fontSize: scaledFont(14),
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  dropdownBox: {
    height: scale(48),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  dropdownBoxActive: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFC",
  },
  dropdownText: {
    fontSize: scaledFont(14),
    color: "#0F172A",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: "#94A3B8",
    fontWeight: "400",
  },
  dropdownIndicator: {
    fontSize: scaledFont(11),
    color: "#64748B",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
    marginTop: scale(4),
  },
  skillPill: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },
  skillPillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  skillPillText: {
    fontSize: scaledFont(12),
    fontWeight: "600",
    color: "#475569",
  },
  skillPillTextActive: {
    color: "#FFFFFF",
  },
  registerButton: {
    height: scale(48),
    backgroundColor: "#2563EB",
    borderRadius: moderateScale(24),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(26),
    elevation: 2,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: scaledFont(15),
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: scale(20),
  },
  footerText: {
    fontSize: scaledFont(13),
    color: "#64748B",
  },
  footerLink: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#0052CC",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    paddingBottom: scale(36),
    maxHeight: "65%",
  },
  sheetHandle: {
    width: scale(36),
    height: scale(4),
    borderRadius: moderateScale(2),
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: scale(14),
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(14),
    paddingBottom: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sheetTitle: {
    fontSize: scaledFont(16),
    fontWeight: "800",
    color: "#0F172A",
  },
  closeBtn: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(8),
  },
  closeBtnText: {
    fontSize: scaledFont(13),
    fontWeight: "700",
    color: "#64748B",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(14),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
    marginBottom: scale(4),
  },
  categoryOptionSelected: {
    backgroundColor: "#EFF6FF",
  },
  categoryOptionText: {
    fontSize: scaledFont(14),
    fontWeight: "600",
    color: "#334155",
  },
  categoryOptionTextActive: {
    color: "#0052CC",
    fontWeight: "700",
  },
  checkMark: {
    fontSize: scaledFont(15),
    fontWeight: "800",
    color: "#0052CC",
  },
});
