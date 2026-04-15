"use client";

import { Dancing_Script } from "next/font/google";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

const dancingAccent = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type LoginTab = "email" | "phone";

type AuthUser = {
  name: string;
  email: string;
  initials: string;
};

type LoginModalContextValue = {
  open: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  isLoggedIn: boolean;
  user: AuthUser | null;
  loginWithEmail: (email: string, password: string) => boolean;
  loginWithPhone: (phone: string, otp: string) => boolean;
  logout: () => void;
  tab: LoginTab;
  setTab: (tab: LoginTab) => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return ctx;
}

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<LoginTab>("email");
  const [user, setUser] = useState<AuthUser | null>(null);

  const DUMMY_EMAIL = "demo@katyayani.com";
  const DUMMY_PASSWORD = "123456";
  const DUMMY_PHONE = "9876543210";
  const DUMMY_OTP = "123456";

  const openLogin = useCallback(() => {
    setOpen(true);
    setTab("email");
  }, []);
  const closeLogin = useCallback(() => setOpen(false), []);
  const logout = useCallback(() => setUser(null), []);

  const createUserFromIdentity = useCallback((identity: string) => {
    const safeIdentity = identity.trim();
    const fallbackName = "Katyayani Shopper";
    const nameBase = safeIdentity.includes("@")
      ? safeIdentity.split("@")[0]
      : safeIdentity;
    const words = nameBase
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    const prettyName =
      words.length > 0
        ? words
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : fallbackName;
    const initials =
      words.length > 0
        ? words
            .slice(0, 2)
            .map((word) => word.charAt(0).toUpperCase())
            .join("")
        : "KS";

    return {
      name: prettyName,
      email: safeIdentity.includes("@")
        ? safeIdentity
        : "shopper@katyayani.com",
      initials,
    };
  }, []);

  const loginWithEmail = useCallback(
    (email: string, password: string) => {
      if (
        email.trim().toLowerCase() !== DUMMY_EMAIL ||
        password.trim() !== DUMMY_PASSWORD
      ) {
        return false;
      }
      setUser(createUserFromIdentity(email || "shopper@katyayani.com"));
      setOpen(false);
      return true;
    },
    [DUMMY_EMAIL, DUMMY_PASSWORD, createUserFromIdentity],
  );

  const loginWithPhone = useCallback(
    (phone: string, otp: string) => {
      const normalizedPhone = phone.replace(/\D/g, "");
      if (normalizedPhone !== DUMMY_PHONE || otp.trim() !== DUMMY_OTP) {
        return false;
      }
      setUser(createUserFromIdentity(phone || "Katyayani Shopper"));
      setOpen(false);
      return true;
    },
    [DUMMY_OTP, DUMMY_PHONE, createUserFromIdentity],
  );

  const value: LoginModalContextValue = {
    open,
    openLogin,
    closeLogin,
    isLoggedIn: Boolean(user),
    user,
    loginWithEmail,
    loginWithPhone,
    logout,
    tab,
    setTab,
  };

  return (
    <LoginModalContext.Provider value={value}>
      {children}
    </LoginModalContext.Provider>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function LoginModal() {
  const { open, closeLogin, tab, setTab, loginWithEmail, loginWithPhone } =
    useLoginModal();
  const titleId = useId();
  const descriptionId = useId();
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLogin();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeLogin]);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmailError("");
      setPhoneError("");
    }
  }, [open]);

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-[100] bg-[#1a1a12]/45 backdrop-blur-[3px] transition-[opacity,backdrop-filter] duration-300 ease-out ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeLogin}
      />

      <div
        className={`fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 transition-[opacity,transform] duration-300 ease-out ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={`relative w-full max-w-[420px] origin-center rounded-[1.35rem] border border-[#eceee4] bg-white shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(158,166,0,0.06)] transition-transform duration-300 ease-out ${
            open ? "scale-100" : "scale-[0.96]"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={closeLogin}
            className="absolute right-3 top-3 cursor-pointer rounded-xl p-2.5 text-[#424242] transition-colors hover:bg-[#f4f5eb] hover:text-[#1a1a1a]"
            aria-label="Close login"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className="px-7 pb-8 pt-9 sm:px-9 sm:pt-10">
            <p id={descriptionId} className="sr-only">
              Sign in with your email and password, or with your phone number
              and a one-time code.
            </p>

            <div className="pr-8">
              <p
                className={`${dancingAccent.className} text-[2rem] leading-tight text-[#9ea600] sm:text-[2.25rem]`}
              >
                Welcome back
              </p>
              <h2
                id={titleId}
                className="mt-1 text-lg font-semibold tracking-tight text-[#1f1f1f]"
              >
                Sign in to Katyayani
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5c5c5c]">
                Access your orders, wishlist, and exclusive drops.
              </p>
            </div>

            <div
              className="mt-7 flex rounded-full bg-[#f0f2e8] p-1"
              role="tablist"
              aria-label="Login method"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "email"}
                id="login-tab-email"
                aria-controls="login-panel-email"
                onClick={() => setTab("email")}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[15px] font-medium transition-all duration-200 ${
                  tab === "email"
                    ? "bg-white text-[#2a2a2a] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                    : "text-[#666] hover:text-[#333]"
                }`}
              >
                <MailIcon className="h-[18px] w-[18px] shrink-0 opacity-80" />
                Email
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "phone"}
                id="login-tab-phone"
                aria-controls="login-panel-phone"
                onClick={() => setTab("phone")}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[15px] font-medium transition-all duration-200 ${
                  tab === "phone"
                    ? "bg-white text-[#2a2a2a] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                    : "text-[#666] hover:text-[#333]"
                }`}
              >
                <PhoneIcon className="h-[18px] w-[18px] shrink-0 opacity-80" />
                Phone
              </button>
            </div>

            <div className="mt-6">
              {tab === "email" ? (
                <form
                  id="login-panel-email"
                  role="tabpanel"
                  aria-labelledby="login-tab-email"
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = String(formData.get("email") ?? "");
                    const password = String(formData.get("password") ?? "");
                    const success = loginWithEmail(email, password);
                    setEmailError(
                      success
                        ? ""
                        : "Invalid credentials. Use demo@katyayani.com / 123456",
                    );
                  }}
                >
                  <div>
                    <label
                      htmlFor="login-email"
                      className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-[border-color,box-shadow] placeholder:text-[#9a9a9a] focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                    />
                    <p className="mt-1 text-[12px] text-[#7a7a7a]">
                      Demo username:{" "}
                      <span className="font-medium">demo@katyayani.com</span>
                    </p>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-[13px] font-medium text-[#9ea600] underline-offset-2 hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-[border-color,box-shadow] placeholder:text-[#9a9a9a] focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                    />
                    <p className="mt-1 text-[12px] text-[#7a7a7a]">
                      Demo password: <span className="font-medium">123456</span>
                    </p>
                  </div>
                  {emailError ? (
                    <p className="text-[13px] font-medium text-[#c14747]">
                      {emailError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    className="mt-2 w-full cursor-pointer rounded-xl bg-[#9ea600] py-3.5 text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(158,166,0,0.35)] transition-[transform,box-shadow] hover:bg-[#8f9500] hover:shadow-[0_6px_20px_rgba(158,166,0,0.4)] active:scale-[0.99]"
                  >
                    Sign in
                  </button>
                </form>
              ) : (
                <form
                  id="login-panel-phone"
                  role="tabpanel"
                  aria-labelledby="login-tab-phone"
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const phone = String(formData.get("phone") ?? "");
                    const otp = String(formData.get("otp") ?? "");
                    const success = loginWithPhone(phone, otp);
                    setPhoneError(
                      success
                        ? ""
                        : "Invalid phone login. Use 9876543210 and OTP 123456",
                    );
                  }}
                >
                  <div>
                    <label
                      htmlFor="login-phone"
                      className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                    >
                      Phone number
                    </label>
                    <div className="flex gap-2">
                      <span className="flex shrink-0 items-center rounded-xl border border-[#e3e5d8] bg-[#f4f5eb] px-3 py-3 text-[15px] font-medium text-[#444] tabular-nums">
                        +91
                      </span>
                      <input
                        id="login-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="98765 43210"
                        className="min-w-0 flex-1 rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-[border-color,box-shadow] placeholder:text-[#9a9a9a] focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                      />
                    </div>
                    <p className="mt-2 text-[13px] text-[#888]">
                      We’ll text you a one-time code to verify it’s you.
                    </p>
                    <p className="mt-1 text-[12px] text-[#7a7a7a]">
                      Demo phone:{" "}
                      <span className="font-medium">9876543210</span>
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="login-otp"
                      className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                    >
                      One-time code
                    </label>
                    <input
                      id="login-otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] tracking-[0.25em] text-[#222] outline-none transition-[border-color,box-shadow] placeholder:text-[#9a9a9a] placeholder:tracking-normal focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                    />
                    <p className="mt-1 text-[12px] text-[#7a7a7a]">
                      Demo OTP: <span className="font-medium">123456</span>
                    </p>
                  </div>
                  {phoneError ? (
                    <p className="text-[13px] font-medium text-[#c14747]">
                      {phoneError}
                    </p>
                  ) : null}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 cursor-pointer rounded-xl border-2 border-[#9ea600] bg-transparent py-3 text-[16px] font-semibold text-[#6b7200] transition-colors hover:bg-[#f7f8ec]"
                    >
                      Send code
                    </button>
                    <button
                      type="submit"
                      className="flex-1 cursor-pointer rounded-xl bg-[#9ea600] py-3 text-[16px] font-semibold text-white shadow-[0_4px_14px_rgba(158,166,0,0.35)] transition-[transform,box-shadow] hover:bg-[#8f9500] hover:shadow-[0_6px_20px_rgba(158,166,0,0.4)] active:scale-[0.99]"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-[14px] text-[#666]">
              New here?{" "}
              <button
                type="button"
                className="font-semibold text-[#9ea600] underline-offset-2 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
