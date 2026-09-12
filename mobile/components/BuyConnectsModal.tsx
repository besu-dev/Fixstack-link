import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import apiClient from "../src/api/client";
import { Alert } from "../src/context/AlertContext";
import { useTheme } from "../src/context/ThemeContext";

interface BuyConnectsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  currentBalance?: number;
}

const PACKAGES = [
  { id: "basic", label: "Starter Pack", connects: 10, priceETB: 50 },
  {
    id: "standard",
    label: "Value Pack",
    connects: 25,
    priceETB: 100,
  },
  { id: "premium", label: "Pro Pack", connects: 60, priceETB: 200 },
];

export default function BuyConnectsModal({
  visible,
  onClose,
  onSuccess,
  currentBalance = 0,
}: BuyConnectsModalProps) {
  const { colors, isDark } = useTheme();
  const [selectedPkg, setSelectedPkg] = useState<string>("standard");
  const [paymentMethod, setPaymentMethod] = useState<"chapa" | "telebirr">(
    "chapa",
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [syncedBalance, setSyncedBalance] = useState<number>(currentBalance);

  useEffect(() => {
    setSyncedBalance(currentBalance);
  }, [currentBalance]);

  useEffect(() => {
    if (!visible) return;

    // Background sync real balance whenever modal opens
    const syncRealBalance = async () => {
      try {
        const res = await apiClient.get("/auth/me");
        const user = res.data?.user || res.data;
        if (typeof user?.connectsBalance === "number") {
          setSyncedBalance(user.connectsBalance);
        }
      } catch {
        const cached = await SecureStore.getItemAsync("user_data");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed.connectsBalance === "number") {
            setSyncedBalance(parsed.connectsBalance);
          }
        }
      }
    };

    syncRealBalance();
  }, [visible]);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (paymentMethod === "chapa") {
        // 1. Initialize Chapa Checkout on backend
        const initRes = await apiClient.post("/wallet/chapa/initialize", {
          packageId: selectedPkg,
        });

        const { checkoutUrl, tx_ref } = initRes.data;

        // 2. Open Chapa Checkout Web View
        await WebBrowser.openAuthSessionAsync(checkoutUrl, "fixlink://");

        // 3. Verify Payment with Chapa through our backend
        const verifyRes = await apiClient.get(`/wallet/chapa/verify/${tx_ref}`);

        Alert.alert(
          "Payment Successful",
          verifyRes.data.message || "Connects added to your wallet!",
        );
        const newBal =
          verifyRes.data.newBalance ?? verifyRes.data.user?.connectsBalance;
        if (typeof newBal === "number") {
          setSyncedBalance(newBal);
          onSuccess(newBal);
        }
        onClose();
      } else {
        // Direct Telebirr Flow (Simulator / Instant USSD)
        const telebirrRes = await apiClient.post("/wallet/telebirr/purchase", {
          packageId: selectedPkg,
        });

        Alert.alert(
          "Purchase Successful! 🎉",
          telebirrRes.data.message || "Connects added via Telebirr.",
        );
        const newBal =
          telebirrRes.data.newBalance ??
          telebirrRes.data.user?.connectsBalance;
        if (typeof newBal === "number") {
          setSyncedBalance(newBal);
          onSuccess(newBal);
        }
        onClose();
      }
    } catch (err: any) {
      console.error("Purchase error:", err.response?.data || err.message);
      Alert.alert(
        "Payment Failed",
        err.response?.data?.message ||
          "Could not complete purchase. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Top Up Connects
              </Text>
              <Text
                style={[
                  styles.balanceSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Current Balance:{" "}
                <Text
                  style={[
                    styles.balanceHighlight,
                    { color: colors.primary },
                  ]}
                >
                  {syncedBalance} Connects
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Package Options */}
          <Text
            style={[styles.sectionLabel, { color: colors.textSecondary }]}
          >
            Select Package
          </Text>
          <View style={styles.packagesContainer}>
            {PACKAGES.map((pkg) => {
              const isSelected = selectedPkg === pkg.id;
              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[
                    styles.packageCard,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryLight
                        : colors.card,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedPkg(pkg.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.packageConnects,
                      {
                        color: isSelected ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    +{pkg.connects} Connects
                  </Text>
                  <Text
                    style={[
                      styles.packagePrice,
                      {
                        color: isSelected
                          ? colors.primary
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {pkg.priceETB} ETB
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Payment Method Selector */}
          <Text
            style={[styles.sectionLabel, { color: colors.textSecondary }]}
          >
            Payment Provider
          </Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor:
                    paymentMethod === "chapa"
                      ? colors.primaryLight
                      : colors.card,
                  borderColor:
                    paymentMethod === "chapa"
                      ? colors.primary
                      : colors.cardBorder,
                },
              ]}
              onPress={() => setPaymentMethod("chapa")}
            >
              <FontAwesome5
                name="credit-card"
                size={16}
                color={
                  paymentMethod === "chapa"
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <View>
                <Text
                  style={[
                    styles.methodText,
                    {
                      color:
                        paymentMethod === "chapa"
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  Chapa Gateway
                </Text>
                <Text
                  style={[
                    styles.methodSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  Telebirr, CBE, Cards
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor:
                    paymentMethod === "telebirr"
                      ? colors.primaryLight
                      : colors.card,
                  borderColor:
                    paymentMethod === "telebirr"
                      ? colors.primary
                      : colors.cardBorder,
                },
              ]}
              onPress={() => setPaymentMethod("telebirr")}
            >
              <FontAwesome5
                name="mobile-alt"
                size={16}
                color={
                  paymentMethod === "telebirr"
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <View>
                <Text
                  style={[
                    styles.methodText,
                    {
                      color:
                        paymentMethod === "telebirr"
                          ? colors.primary
                          : colors.text,
                    },
                  ]}
                >
                  Direct Telebirr
                </Text>
                <Text
                  style={[
                    styles.methodSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  Instant USSD Push
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Checkout CTA */}
          <TouchableOpacity
            style={[
              styles.checkoutBtn,
              { backgroundColor: colors.primary },
              loading && styles.checkoutBtnDisabled,
            ]}
            onPress={handlePurchase}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkoutBtnText}>
                {paymentMethod === "chapa"
                  ? "Proceed to Chapa Gateway"
                  : "Pay with Telebirr"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  balanceSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  balanceHighlight: {
    color: "#0052CC",
    fontWeight: "700",
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 10,
    marginTop: 6,
    textTransform: "uppercase",
  },
  packagesContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  packageCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  packageCardSelected: {
    borderColor: "#0052CC",
    backgroundColor: "#EFF6FF",
  },
  packageConnects: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  textSelected: {
    color: "#0052CC",
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  methodCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  methodCardSelected: {
    borderColor: "#0052CC",
    backgroundColor: "#EFF6FF",
  },
  methodText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  methodTextSelected: {
    color: "#0052CC",
  },
  methodSubtext: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
  },
  checkoutBtn: {
    backgroundColor: "#0052CC",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
