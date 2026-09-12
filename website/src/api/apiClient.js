/**
 * FixLink API Client
 * Connects directly to the existing Express/MongoDB backend API
 */

const normalizeApiUrl = (url) => {
  if (!url) return 'http://localhost:5000/api';
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_BASE_URL);

export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
 
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export { API_BASE_URL };
