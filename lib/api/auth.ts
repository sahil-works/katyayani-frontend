import { apiGet, apiPost } from "./client";

export type CustomerUserDto = {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

export type AuthSessionDto = {
  user?: CustomerUserDto;
  customer?: CustomerUserDto;
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: string | number;
};

type ProfileResponseDto = CustomerUserDto | {
  user?: CustomerUserDto;
  customer?: CustomerUserDto;
};

export type CustomerUser = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  initials: string;
};

export type AuthSession = {
  user?: CustomerUser;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string | number;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginInput = LoginRequest;
export type RegisterInput = RegisterRequest;

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

function isProfileWrapper(
  payload: ProfileResponseDto,
): payload is { user?: CustomerUserDto; customer?: CustomerUserDto } {
  return "user" in payload || "customer" in payload;
}

function resolveProfileUser(payload: ProfileResponseDto): CustomerUserDto {
  if (isProfileWrapper(payload)) {
    const user = payload.user ?? payload.customer;
    if (!user) {
      throw new Error("Profile response did not include a customer.");
    }
    return user;
  }

  return payload;
}

export function normalizeCustomerUser(user: CustomerUserDto): CustomerUser {
  const firstName = user.firstName?.trim() || undefined;
  const lastName = user.lastName?.trim() || undefined;
  const fullName =
    user.name?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    user.email?.split("@")[0] ||
    "Katyayani Shopper";

  return {
    id: user.id,
    name: fullName,
    firstName,
    lastName,
    email: user.email ?? undefined,
    phone: user.phone ?? undefined,
    initials: getInitials(fullName, user.email ?? undefined),
  };
}

function unwrapAuthPayload(
  payload: AuthSessionDto | null | undefined,
  { requireUser }: { requireUser: boolean },
): AuthSession {
  const user = payload?.user ?? payload?.customer;
  const accessToken =
    payload?.accessToken ?? payload?.access_token ?? payload?.token;
  const refreshToken = payload?.refreshToken ?? payload?.refresh_token;

  if (!accessToken) {
    throw new Error("Auth response did not include an access token.");
  }

  if (requireUser && !user) {
    throw new Error("Auth response did not include a customer.");
  }

  return {
    user: user ? normalizeCustomerUser(user) : undefined,
    accessToken,
    refreshToken,
    expiresIn: payload?.expiresIn,
  };
}

export async function registerCustomer(input: RegisterInput) {
  const result = await apiPost<AuthSessionDto>("/auth/register", {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
  });
  return unwrapAuthPayload(result.data, { requireUser: true });
}

export async function loginCustomer(input: LoginInput) {
  const result = await apiPost<AuthSessionDto>("/auth/login", {
    email: input.email,
    password: input.password,
  });
  return unwrapAuthPayload(result.data, { requireUser: true });
}

export async function refreshCustomerSession(refreshToken?: string | null) {
  const result = await apiPost<AuthSessionDto>(
    "/auth/refresh",
    refreshToken ? { refreshToken } : null,
  );
  return unwrapAuthPayload(result.data, { requireUser: false });
}

export async function logoutCustomer() {
  await apiPost<unknown>("/auth/logout", null, { auth: true });
}

export async function getCustomerProfile() {
  const result = await apiGet<ProfileResponseDto>("/users/me", undefined, {
    auth: true,
  });

  return normalizeCustomerUser(resolveProfileUser(result.data));
}
