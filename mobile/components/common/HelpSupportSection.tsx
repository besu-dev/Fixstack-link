import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  scale,
  moderateScale,
  scaledFont,
} from "../../src/utils/responsive";
import AppAlert from "../../src/context/AlertContext";

export type UserRole = "customer" | "provider";

export interface HelpSupportSectionProps {
  role: UserRole;
  onBack?: () => void;
  showHeader?: boolean;
}

type ModalType = "contact" | null;

export default function HelpSupportSection({
  role,
  onBack,
  showHeader = true,
}: HelpSupportSectionProps) {
  const router = useRouter();

  // Active modal
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Contact actions
  const handleCall = () => {
    Linking.openURL("tel:+251900123456").catch(() => {
      AppAlert.alert(
        "Phone Call",
        "Could not launch dialer. Support hotline: +251 900 123 456",
      );
    });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(
      `FixLink Support Request [${role === "provider" ? "Service Provider" : "Service Seeker"}]`,
    );
    Linking.openURL(`mailto:support@fixlink.com?subject=${subject}`).catch(
      () => {
        AppAlert.alert(
          "Email Support",
          "Could not launch mail client. Please contact: support@fixlink.com",
        );
      },
    );
  };

  const handleChat = () => {
    setActiveModal(null);
    if (role === "provider") {
      router.push("/(provider-tabs)/message" as any);
    } else {
      router.push("/(customer-tabs)/message" as any);
    }
  };

  const supportOptions = [
    {
      id: "contact" as ModalType,
      title: "Contact Support",
      description:
        role === "provider"
          ? "Get help from Bete Support team"
          : "Get help from Bete Support team",
      icon: "phone-call" as keyof typeof Feather.glyphMap,
      iconColor: "#16A34A",
      iconBg: "#DCFCE7",
    },
  ];

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name="arrow-left"
                size={moderateScale(20)}
                color="#0F172A"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerIconPlaceholder} />
          )}
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {supportOptions.map((item, index) => {
            const isLast = index === supportOptions.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, isLast && styles.menuItemLast]}
                onPress={() => setActiveModal(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.menuIconBox, { backgroundColor: item.iconBg }]}
                >
                  <Feather
                    name={item.icon}
                    size={moderateScale(17)}
                    color={item.iconColor}
                  />
                </View>

                <View style={styles.menuTextCol}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={moderateScale(18)}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            );
          })}
        </View>


      </ScrollView>


      <Modal
        visible={activeModal === "contact"}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Contact Support</Text>
                <Text style={styles.modalSubtitle}>
                  Choose your preferred contact channel
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setActiveModal(null)}
              >
                <Feather name="x" size={moderateScale(18)} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.contactOptions}>


              {/* Call Hotline */}
              <TouchableOpacity
                style={styles.contactCard}
                onPress={handleCall}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.contactIconBox,
                    { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <Feather
                    name="phone"
                    size={moderateScale(20)}
                    color="#16A34A"
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Call Support Hotline</Text>
                  <Text style={styles.contactSub}>
                    +251 900 123 456 • Available 24/7
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={moderateScale(18)}
                  color="#94A3B8"
                />
              </TouchableOpacity>

              {/* Email Support */}
              <TouchableOpacity
                style={styles.contactCard}
                onPress={handleEmail}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.contactIconBox,
                    { backgroundColor: "#FEF3C7" },
                  ]}
                >
                  <Feather
                    name="mail"
                    size={moderateScale(20)}
                    color="#D97706"
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email Us</Text>
                  <Text style={styles.contactSub}>
                    supportbete@gmail.com • Response within 24h
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={moderateScale(18)}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerIconPlaceholder: {
    width: moderateScale(36),
  },
  headerTitle: {
    fontSize: scaledFont(16),
    fontWeight: "700",
    color: "#0F172A",
  },
  headerRightPlaceholder: {
    width: moderateScale(36),
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(36),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: scale(4),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(13),
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  menuTextCol: {
    flex: 1,
    paddingRight: scale(8),
  },
  menuTitle: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#1E293B",
  },
  menuSubtitle: {
    fontSize: scaledFont(11.5),
    color: "#64748B",
    marginTop: scale(2),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    paddingBottom: scale(36),
    maxHeight: "82%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(14),
  },
  modalTitle: {
    fontSize: scaledFont(17),
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: scaledFont(12),
    color: "#64748B",
    marginTop: scale(2),
  },
  modalCloseBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  // Contact Channels
  contactOptions: {
    gap: scale(10),
    marginTop: scale(6),
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(14),
    padding: scale(14),
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  contactIconBox: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#0F172A",
  },
  contactSub: {
    fontSize: scaledFont(11.5),
    color: "#64748B",
    marginTop: scale(2),
  },
});
