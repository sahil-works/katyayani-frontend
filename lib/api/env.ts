import { ApiConfigurationError } from "./errors";

const API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!rawBaseUrl) {
    throw new ApiConfigurationError(
      `${API_BASE_URL_ENV} is required for storefront API requests.`,
    );
  }

  if (rawBaseUrl.startsWith("/")) {
    return trimTrailingSlash(rawBaseUrl);
  }

  try {
    return trimTrailingSlash(new URL(rawBaseUrl).toString());
  } catch {
    throw new ApiConfigurationError(
      `${API_BASE_URL_ENV} must be an absolute URL or same-origin path.`,
    );
  }
}
