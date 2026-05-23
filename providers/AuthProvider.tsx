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
  getCustomerProfile,
  loginCustomer,
  logoutCustomer,
  refreshCustomerSession,
  registerCustomer,
  type CustomerUser,
  type LoginInput,
  type RegisterInput,
} from "../lib/api/auth";
import { clearAccessToken, setAccessToken } from "../lib/auth/tokenStore";

type AuthStatus = "initializing" | "authenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
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
    async ({
      accessToken,
      user: sessionUser,
    }: {
      accessToken: string;
      user: CustomerUser;
    }) => {
      setAccessToken(accessToken);
      setUser(sessionUser);
      setStatus("authenticated");

      try {
        const profile = await getCustomerProfile();
        setUser(profile);
      } catch {
        // The auth response user is enough to keep the storefront usable.
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const session = await refreshCustomerSession();
      await applySession(session);
    } catch {
      clearAccessToken();
      setUser(null);
      setStatus("guest");
    }
  }, [applySession]);

  useEffect(() => {
    if (refreshStartedRef.current) return;
    refreshStartedRef.current = true;
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await loginCustomer(input);
      await applySession(session);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const session = await registerCustomer(input);
      await applySession(session);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutCustomer();
    } finally {
      clearAccessToken();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const value: AuthContextValue = {
    status,
    user,
    isAuthenticated: status === "authenticated" && Boolean(user),
    login,
    register,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
