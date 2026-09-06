import React, { createContext, useContext, useState, useCallback } from "react";
import AppDialog, { DialogButton } from "../../components/common/AppDialog";

interface AlertContextType {
  showAlert: (
    title: string,
    message?: string,
    buttons?: DialogButton[]
  ) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    isDestructive?: boolean
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

// Global singleton reference so non-React functions or deep hooks can trigger alerts easily
let globalAlertHandler: AlertContextType | null = null;

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [buttons, setButtons] = useState<DialogButton[]>([{ text: "OK" }]);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const showAlert = useCallback(
    (
      alertTitle: string,
      alertMessage?: string,
      alertButtons?: DialogButton[]
    ) => {
      setTitle(alertTitle);
      setMessage(alertMessage);

      if (alertButtons && alertButtons.length > 0) {
        // Wrap button callbacks to automatically hide the alert upon selection
        const wrappedButtons = alertButtons.map((btn) => ({
          ...btn,
          onPress: () => {
            setVisible(false);
            if (btn.onPress) {
              btn.onPress();
            }
          },
        }));
        setButtons(wrappedButtons);
      } else {
        setButtons([
          {
            text: "OK",
            onPress: () => setVisible(false),
          },
        ]);
      }

      setVisible(true);
    },
    []
  );

  const showConfirm = useCallback(
    (
      confirmTitle: string,
      confirmMessage: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText = "Confirm",
      cancelText = "Cancel",
      isDestructive = false
    ) => {
      setTitle(confirmTitle);
      setMessage(confirmMessage);
      setButtons([
        {
          text: cancelText,
          style: "cancel",
          onPress: () => {
            setVisible(false);
            if (onCancel) onCancel();
          },
        },
        {
          text: confirmText,
          style: isDestructive ? "destructive" : "default",
          onPress: () => {
            setVisible(false);
            onConfirm();
          },
        },
      ]);
      setVisible(true);
    },
    []
  );

  // Expose methods to the global singleton handler
  globalAlertHandler = {
    showAlert,
    showConfirm,
    hideAlert,
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, hideAlert }}>
      {children}
      <AppDialog
        visible={visible}
        title={title}
        message={message}
        buttons={buttons}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAppAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAppAlert must be used within an AlertProvider");
  }
  return context;
};

/**
 * Universal AppAlert helper: Drop-in replacement for React Native's native Alert.alert
 * Accessible anywhere in the application.
 */
export class AppAlert {
  static alert(
    title: string,
    message?: string,
    buttons?: DialogButton[]
  ) {
    if (globalAlertHandler) {
      globalAlertHandler.showAlert(title, message, buttons);
    } else {
      console.warn("AppAlert called before AlertProvider was mounted.");
    }
  }

  static confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
  ) {
    if (globalAlertHandler) {
      globalAlertHandler.showConfirm(
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        isDestructive
      );
    } else {
      console.warn("AppAlert called before AlertProvider was mounted.");
    }
  }
}

export const Alert = AppAlert;
export default AppAlert;
