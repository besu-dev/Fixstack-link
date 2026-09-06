import client from "../api/client";

// Resolve base server URL (stripping trailing /api)
export const SERVER_BASE_URL = (
  client.defaults.baseURL || "http://10.0.2.2:5000/api"
).replace(/\/api\/?$/, "");

/**
 * Normalizes any avatarUrl (relative uploads path, Windows backslash, or full URL)
 * into a fully qualified URL loadable by React Native Image.
 */
export const getAvatarUri = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return null;

  // Already an absolute remote or local file URI
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Normalize path separators from Windows uploads\file.ext to uploads/file.ext
  const cleanPath = trimmed.replace(/\\/g, "/");
  const filename = cleanPath.split("/").pop();
  if (!filename) return null;

  return `${SERVER_BASE_URL}/uploads/${filename}`;
};

/**
 * Telegram-style curated vibrant color palette
 */
export const TELEGRAM_AVATAR_COLORS = [
  "#0088CC", // Telegram Blue
  "#2AABEE", // Cyan
  "#7085FF", // Indigo
  "#A66CFF", // Violet
  "#F56B2A", // Warm Orange
  "#E54B4B", // Coral Red
  "#22B573", // Mint Green
  "#00A389", // Teal
  "#E67E22", // Amber
  "#8E44AD", // Deep Purple
];

/**
 * Generates a deterministic vibrant background color from a user's name
 */
export const getAvatarColor = (name?: string | null): string => {
  if (!name || typeof name !== "string") return TELEGRAM_AVATAR_COLORS[0];
  const trimmed = name.trim();
  if (!trimmed) return TELEGRAM_AVATAR_COLORS[0];

  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = trimmed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TELEGRAM_AVATAR_COLORS.length;
  return TELEGRAM_AVATAR_COLORS[index];
};

/**
 * Extracts the capitalized initial character for Telegram-style avatar fallback
 */
export const getInitial = (name?: string | null): string => {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase() || "?";
};
