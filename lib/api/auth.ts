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

export type SendOtpInput = {
  phone: string;
};

export type VerifyOtpInput = {
  phone: string;
  otp: string;
};

export type CompleteSignupInput = {
  signupToken?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  email?: string;
};

export type OtpVerifyResult =
  | { requiresSignup: true; signupToken?: string }
  | { requiresSignup: false; session: AuthSession };

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

type OtpVerifyDto = AuthSessionDto & {
  signupRequired?: boolean;
  isNewUser?: boolean;
  requiresProfile?: boolean;
  requiresProfileCompletion?: boolean;
  signupToken?: string;
  signup_token?: string;
};

function parseOtpVerifyResponse(payload: OtpVerifyDto | null | undefined): OtpVerifyResult {
  console.log("=================================");
  console.log("AUTH BUILD MARKER: 2026-07-02-V1");
  console.log("parseOtpVerifyResponse payload:", payload);
  console.log("=================================");

  if (typeof window !== "undefined") {
    (window as Window & { __AUTH_BUILD_MARKER__?: string }).__AUTH_BUILD_MARKER__ =
      "2026-07-02-V1";
  }

  if (!payload) {
    throw new Error("Unexpected OTP verification response");
  }

  const signupToken = payload.signupToken ?? payload.signup_token;
  const signupRequired =
    payload.signupRequired === true ||
    Boolean(
      signupToken &&
        (payload.isNewUser === true ||
          payload.requiresProfile === true ||
          payload.requiresProfileCompletion === true),
    );

  if (signupRequired) {
    return signupToken ? { requiresSignup: true, signupToken } : { requiresSignup: true };
  }

  const accessToken =
    payload.accessToken ?? payload.access_token ?? payload.token;
  const user = payload.user ?? payload.customer;

  if (accessToken && user) {
    return {
      requiresSignup: false,
      session: unwrapAuthPayload(payload, { requireUser: true }),
    };
  }

  if (signupToken) {
    return { requiresSignup: true, signupToken };
  }

  throw new Error("Unexpected OTP verification response");
}

export async function sendCustomerOtp(input: SendOtpInput) {
  await apiPost<unknown>("/auth/otp/send", {
    phone: input.phone,
  });
}

export async function verifyCustomerOtp(input: VerifyOtpInput) {
  const result = await apiPost<OtpVerifyDto>("/auth/otp/verify", {
    phone: input.phone,
    otp: input.otp,
  });
  return parseOtpVerifyResponse(result.data);
}

export async function completeCustomerSignup(input: CompleteSignupInput) {
  if (!input.signupToken && !input.phone) {
    throw new Error("Signup completion requires a verified phone or signup token.");
  }

  const result = await apiPost<AuthSessionDto>("/auth/signup/complete", {
    ...(input.signupToken ? { signupToken: input.signupToken } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    firstName: input.firstName,
    lastName: input.lastName,
    ...(input.email ? { email: input.email } : {}),
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
