import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { scale, moderateScale, scaledFont } from "../../src/utils/responsive";
import { useTheme } from "../../src/context/ThemeContext";

export interface DialogButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: DialogButton[];
  onDismiss?: () => void;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK" }],
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.dialogCard,
                { backgroundColor: colors.surface },
              ]}
            >
              {/* Title */}
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>

              {/* Message */}
              {Boolean(message) && (
                <Text
                  style={[
                    styles.message,
                    { color: colors.textSecondary },
                  ]}
                >
                  {message}
                </Text>
              )}

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                {buttons.map((btn, index) => {
                  const isCancel = btn.style === "cancel";
                  const isDestructive = btn.style === "destructive";

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.actionBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (btn.onPress) {
                          btn.onPress();
                        }
                        if (onDismiss) {
                          onDismiss();
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: colors.primary },
                          isCancel && [
                            styles.cancelBtnText,
                            { color: colors.textSecondary },
                          ],
                          isDestructive && [
                            styles.destructiveBtnText,
                            { color: colors.danger },
                          ],
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },
  dialogCard: {
    width: "100%",
    maxWidth: scale(340),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    paddingHorizontal: scale(22),
    paddingTop: scale(22),
    paddingBottom: scale(16),
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: scaledFont(18),
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: scale(10),
  },
  message: {
    fontSize: scaledFont(14),
    color: "#475569",
    lineHeight: scale(20),
    marginBottom: scale(22),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: scale(12),
  },
  actionBtn: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(8),
  },
  actionBtnText: {
    fontSize: scaledFont(14),
    fontWeight: "700",
    color: "#0052CC",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "600",
  },
  destructiveBtnText: {
    color: "#DC2626",
    fontWeight: "700",
  },
});

export default AppDialog;
