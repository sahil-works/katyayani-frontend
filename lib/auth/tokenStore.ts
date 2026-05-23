let accessToken: string | null = null;
let refreshToken: string | null = null;

const REFRESH_TOKEN_STORAGE_KEY = "katyayani_customer_refresh_token";

function readStoredRefreshToken() {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;

  try {
    if (token) {
      window.sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // If storage is unavailable, auth still works until the page reloads.
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getRefreshToken() {
  refreshToken = refreshToken ?? readStoredRefreshToken();
  return refreshToken;
}

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  writeStoredRefreshToken(token);
}

export function clearAccessToken() {
  accessToken = null;
}

export function clearRefreshToken() {
  setRefreshToken(null);
}

export function clearAuthTokens() {
  clearAccessToken();
  clearRefreshToken();
}
