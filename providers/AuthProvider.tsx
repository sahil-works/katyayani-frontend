"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  completeCustomerSignup,
  confirmEmailChange,
  confirmPhoneChange,
  getCustomerProfile,
  logoutCustomer,
  refreshCustomerSession,
  requestEmailChange,
  requestPhoneChange,
  sendCustomerOtp,
  updateCustomerProfile,
  verifyCustomerOtp,
  type CompleteSignupInput,
  type CustomerUser,
  type OtpVerifyResult,
  type AuthSession,
  type UpdateProfileInput,
} from "../lib/api/auth";
import {
  clearAuthTokens,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../lib/auth/tokenStore";

type AuthStatus = "initializing" | "authenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: CustomerUser | null;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (input: { phone: string; otp: string }) => Promise<OtpVerifyResult>;
  completeSignup: (input: CompleteSignupInput) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<CustomerUser>;
  requestEmailOtp: (email: string) => Promise<void>;
  confirmEmailOtp: (email: string, otp: string) => Promise<CustomerUser>;
  requestPhoneOtp: (phone: string) => Promise<void>;
  confirmPhoneOtp: (phone: string, otp: string) => Promise<CustomerUser>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [user, setUser] = useState<CustomerUser | null>(null);
  const refreshStartedRef = useRef(false);

  const applySession = useCallback(
    async ({ accessToken, refreshToken, user: sessionUser }: AuthSession) => {
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      if (sessionUser) {
        setUser(sessionUser);
        setStatus("authenticated");
      }

      try {
        const profile = await getCustomerProfile();
        setUser(profile);
        setStatus("authenticated");
      } catch {
        if (sessionUser) {
          // The auth response user is enough to keep the storefront usable.
          setStatus("authenticated");
          return;
        }

        clearAuthTokens();
        setUser(null);
        setStatus("guest");
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      const session = await refreshCustomerSession(refreshToken);
      await applySession(session);
    } catch {
      clearAuthTokens();
      setUser(null);
      setStatus("guest");
    }
  }, [applySession]);

  useEffect(() => {
    if (refreshStartedRef.current) return;
    refreshStartedRef.current = true;
    void refresh();
  }, [refresh]);

  const sendOtp = useCallback(async (phone: string) => {
    await sendCustomerOtp({ phone });
  }, []);

  const verifyOtp = useCallback(
    async (input: { phone: string; otp: string }) => {
      const result = await verifyCustomerOtp(input);

      if (!result.requiresSignup) {
        await applySession(result.session);
      }

      return result;
    },
    [applySession],
  );

  const completeSignup = useCallback(
    async (input: CompleteSignupInput) => {
      const session = await completeCustomerSignup(input);
      await applySession(session);
    },
    [applySession],
  );

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const updated = await updateCustomerProfile(input);
    setUser(updated);
    return updated;
  }, []);

  const requestEmailOtp = useCallback(async (email: string) => {
    await requestEmailChange(email);
  }, []);

  const confirmEmailOtp = useCallback(async (email: string, otp: string) => {
    const updated = await confirmEmailChange(email, otp);
    setUser(updated);
    return updated;
  }, []);

  const requestPhoneOtp = useCallback(async (phone: string) => {
    await requestPhoneChange(phone);
  }, []);

  const confirmPhoneOtp = useCallback(async (phone: string, otp: string) => {
    const updated = await confirmPhoneChange(phone, otp);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } finally {
      clearAuthTokens();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const value: AuthContextValue = {
    status,
    user,
    isAuthenticated: status === "authenticated" && Boolean(user),
    sendOtp,
    verifyOtp,
    completeSignup,
    updateProfile,
    requestEmailOtp,
    confirmEmailOtp,
    requestPhoneOtp,
    confirmPhoneOtp,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
