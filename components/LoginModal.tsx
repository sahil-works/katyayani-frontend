"use client";

import { Dancing_Script } from "next/font/google";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { getApiErrorMessage } from "../lib/api/errors";
import { useAuth } from "../providers/AuthProvider";

const dancingAccent = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type AuthTab = "login" | "register";

type LoginModalContextValue = {
  open: boolean;
  openLogin: () => void;
  closeLogin: () => void;
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

  const openLogin = useCallback(() => setOpen(true), []);
  const closeLogin = useCallback(() => setOpen(false), []);

  return (
    <LoginModalContext.Provider value={{ open, openLogin, closeLogin }}>
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

export function LoginModal() {
  const { open, closeLogin } = useLoginModal();
  const { login, register, status } = useAuth();
  const titleId = useId();
  const descriptionId = useId();
  const [tab, setTab] = useState<AuthTab>("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!open) return;
    setError("");
  }, [open, tab]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      closeLogin();
    } catch (authError) {
      setError(getApiErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      await register({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? "") || undefined,
        password: String(formData.get("password") ?? ""),
      });
      closeLogin();
    } catch (authError) {
      setError(getApiErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

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
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={`relative w-full max-w-[440px] origin-center rounded-[1.35rem] border border-[#eceee4] bg-white shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(158,166,0,0.06)] transition-transform duration-300 ease-out ${
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
              Customer login and registration for Katyayani storefront.
            </p>

            <div className="pr-8">
              <p
                className={`${dancingAccent.className} text-[2rem] leading-tight text-[#9ea600] sm:text-[2.25rem]`}
              >
                Welcome
              </p>
              <h2
                id={titleId}
                className="mt-1 text-lg font-semibold tracking-tight text-[#1f1f1f]"
              >
                {tab === "login" ? "Sign in to Katyayani" : "Create your account"}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5c5c5c]">
                Customer auth is separate from admin access and keeps tokens out
                of localStorage.
              </p>
            </div>

            <div className="mt-7 flex rounded-full bg-[#f0f2e8] p-1">
              <button
                type="button"
                onClick={() => setTab("login")}
                className={`flex flex-1 items-center justify-center rounded-full py-2.5 text-[15px] font-medium transition-all ${
                  tab === "login"
                    ? "bg-white text-[#2a2a2a] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                    : "text-[#666] hover:text-[#333]"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className={`flex flex-1 items-center justify-center rounded-full py-2.5 text-[15px] font-medium transition-all ${
                  tab === "register"
                    ? "bg-white text-[#2a2a2a] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                    : "text-[#666] hover:text-[#333]"
                }`}
              >
                Register
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={tab === "login" ? handleLogin : handleRegister}
            >
              {tab === "register" ? (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                  >
                    Name
                  </label>
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                />
              </div>

              {tab === "register" ? (
                <div>
                  <label
                    htmlFor="auth-phone"
                    className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                  >
                    Phone
                  </label>
                  <input
                    id="auth-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  required
                  className="w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20"
                />
              </div>

              {error ? (
                <p className="text-[13px] font-medium text-[#c14747]">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || status === "initializing"}
                className="mt-2 w-full cursor-pointer rounded-xl bg-[#9ea600] py-3.5 text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(158,166,0,0.35)] transition-[transform,box-shadow] hover:bg-[#8f9500] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : tab === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
