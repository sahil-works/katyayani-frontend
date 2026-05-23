import { apiGet, apiPost } from "./client";

export type CustomerUserApiResponse = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

type AuthPayload = {
  user?: CustomerUserApiResponse;
  customer?: CustomerUserApiResponse;
  accessToken?: string;
  token?: string;
};

export type CustomerUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  initials: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

function getInitials(name: string, email?: string) {
  const source = name.trim() || email?.split("@")[0] || "Customer";
  const words = source
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words.length > 0
    ? words
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
    : "CS";
}

export function normalizeCustomerUser(user: CustomerUserApiResponse): CustomerUser {
  const fullName =
    user.name?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.email?.split("@")[0] ||
    "Katyayani Shopper";

  return {
    id: user.id,
    name: fullName,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    initials: getInitials(fullName, user.email ?? undefined),
  };
}

function unwrapAuthPayload(payload: AuthPayload) {
  const user = payload.user ?? payload.customer;
  const accessToken = payload.accessToken ?? payload.token;

  if (!user || !accessToken) {
    throw new Error("Auth response did not include a customer and access token.");
  }

  return {
    user: normalizeCustomerUser(user),
    accessToken,
  };
}

export async function registerCustomer(input: RegisterInput) {
  const result = await apiPost<AuthPayload>("/auth/register", input);
  return unwrapAuthPayload(result.data);
}

export async function loginCustomer(input: LoginInput) {
  const result = await apiPost<AuthPayload>("/auth/login", input);
  return unwrapAuthPayload(result.data);
}

export async function refreshCustomerSession() {
  const result = await apiPost<AuthPayload>("/auth/refresh", null);
  return unwrapAuthPayload(result.data);
}

export async function logoutCustomer() {
  await apiPost<unknown>("/auth/logout", null, { auth: true });
}

export async function getCustomerProfile() {
  const result = await apiGet<CustomerUserApiResponse>("/users/me", undefined, {
    auth: true,
  });

  return normalizeCustomerUser(result.data);
}
