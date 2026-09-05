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
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const SERVICE_TAXONOMY: Record<string, string[]> = {
  "Plumbing & Water Systems": [
    "Tanker Pump",
    "Pipe Leak",
    "Water Heater",
    "Bathroom Fit",
  ],
  "Electrical & Power": [
    "House Wiring",
    "Generator",
    "Solar System",
    "Breaker Fix",
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
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.brandName}>FixLink</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#002B49",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 4,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 6,
  },
  subSkillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  dropdownBoxActive: {
    borderColor: "#2563EB",
    backgroundColor: "#F8FAFC",
  },
  dropdownText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    color: "#94A3B8",
    fontWeight: "400",
  },
  dropdownIndicator: {
    fontSize: 11,
    color: "#64748B",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  skillPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },
  skillPillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  skillPillTextActive: {
    color: "#FFFFFF",
  },
  registerButton: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    elevation: 2,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: "65%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryOptionSelected: {
    backgroundColor: "#EFF6FF",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  categoryOptionTextActive: {
    color: "#0052CC",
    fontWeight: "700",
  },
  checkMark: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0052CC",
  },
});
