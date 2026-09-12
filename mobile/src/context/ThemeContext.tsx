import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

export interface ThemeColors {
  background: string;
  canvas: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
  accent: string;
  accentLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderSubtle: string;
  card: string;
  cardBorder: string;
  inputBackground: string;
  inputBorder: string;
  navBar: string;
  navBarBorder: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  statusBarStyle: "dark-content" | "light-content";
}

export const lightColors: ThemeColors = {
  background: "#FFFFFF",
  canvas: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",
  surfaceTertiary: "#E2E8F0",
  primary: "#0052CC",
  primaryDark: "#002B49",
  primaryLight: "#EFF6FF",
  primaryMuted: "#DBEAFE",
  accent: "#FF6B00",
  accentLight: "#FFF7ED",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",
  border: "#E2E8F0",
  borderSubtle: "#F1F5F9",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  inputBackground: "#F8FAFC",
  inputBorder: "#CBD5E1",
  navBar: "#0052CC",
  navBarBorder: "transparent",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  statusBarStyle: "dark-content",
};

export const darkColors: ThemeColors = {
  background: "#0B132B",
  canvas: "#070E22",
  surface: "#1C2541",
  surfaceSecondary: "#232F53",
  surfaceTertiary: "#2A3860",
  primary: "#3B82F6",
  primaryDark: "#1D4ED8",
  primaryLight: "#1E293B",
  primaryMuted: "#1E3A8A",
  accent: "#FF8A33",
  accentLight: "#382312",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  textInverse: "#0F172A",
  border: "#334155",
  borderSubtle: "#1E293B",
  card: "#1C2541",
  cardBorder: "#2E3C62",
  inputBackground: "#131C35",
  inputBorder: "#334155",
  navBar: "#131C35",
  navBarBorder: "#2E3C62",
  danger: "#F87171",
  dangerLight: "#3B1818",
  success: "#34D399",
  successLight: "#063726",
  warning: "#FBBF24",
  warningLight: "#392A06",
  statusBarStyle: "light-content",
};

export const themes = {
  light: lightColors,
  dark: darkColors,
};

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const STORAGE_KEY = "app_theme_mode";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemeModeState(saved);
        }
      } catch (err) {
        console.warn("Failed to load theme preference from SecureStore:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await SecureStore.setItemAsync(STORAGE_KEY, mode);
    } catch (err) {
      console.warn("Failed to save theme preference:", err);
    }
  };

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemColorScheme === "dark");

  const toggleTheme = async () => {
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    await setThemeMode(nextMode);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
