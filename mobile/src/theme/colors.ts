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
