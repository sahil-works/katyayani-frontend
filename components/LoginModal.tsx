"use client";

import { Dancing_Script } from "next/font/google";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { getApiErrorMessage } from "../lib/api/errors";
import {
  formatIndianMobileDisplay,
  NAME_MAX_LENGTH,
  normalizeIndianMobile,
  OTP_LENGTH,
  validateMobileInput,
  validateOtpInput,
  validateProfileCompletion,
  type FieldErrors,
} from "../lib/auth/validation";
import { useAuth } from "../providers/AuthProvider";

const dancingAccent = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const RESEND_COOLDOWN_SECONDS = 30;

type AuthStep = "phone" | "otp" | "profile";

export type AuthIntent = {
  reason?: "checkout" | "account" | "header";
  onSuccess?: () => void;
};

type LoginModalContextValue = {
  open: boolean;
  intent: AuthIntent | null;
  openLogin: (intent?: AuthIntent) => void;
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
  const [intent, setIntent] = useState<AuthIntent | null>(null);

  const openLogin = useCallback((nextIntent?: AuthIntent) => {
    setIntent(nextIntent ?? null);
    setOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setOpen(false);
    setIntent(null);
  }, []);

  return (
    <LoginModalContext.Provider value={{ open, intent, openLogin, closeLogin }}>
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-[13px] font-medium text-[#c14747]">{message}</p>;
}

const inputClassName =
  "w-full rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-3 text-[16px] text-[#222] outline-none focus:border-[#9ea600] focus:bg-white focus:ring-[3px] focus:ring-[#9ea600]/20";

const inputErrorClassName =
  "border-[#e8b4b4] focus:border-[#c14747] focus:ring-[#c14747]/15";

function stepTitle(step: AuthStep) {
  if (step === "phone") return "Sign in with mobile";
  if (step === "otp") return "Verify OTP";
  return "Complete your profile";
}

function stepDescription(step: AuthStep, phone: string) {
  if (step === "phone") {
    return "Enter your Indian mobile number. We will send a one-time password to verify you.";
  }
  if (step === "otp") {
    return `Enter the 6-digit code sent to ${formatIndianMobileDisplay(phone)}.`;
  }
  return "Add your name to finish creating your Katyayani account.";
}

export function LoginModal() {
  const { open, intent, closeLogin } = useLoginModal();
  const { sendOtp, verifyOtp, completeSignup, status } = useAuth();
  const titleId = useId();
  const descriptionId = useId();

  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const closedRef = useRef(false);

  const resetForm = useCallback(() => {
    setStep("phone");
    setPhone("");
    setNormalizedPhone("");
    setOtp("");
    setSignupToken("");
    setFormError("");
    setFieldErrors({});
    setIsSubmitting(false);
    setResendSeconds(0);
  }, []);

  useEffect(() => {
    if (open) {
      closedRef.current = false;
      return;
    }
    resetForm();
  }, [open, resetForm]);

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
    if (!open || step !== "otp" || resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, step, resendSeconds]);

  function finishAuth() {
    const onSuccess = intent?.onSuccess;
    closeLogin();
    onSuccess?.();
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const mobileErrors = validateMobileInput(phone);
    if (mobileErrors) {
      setFieldErrors(mobileErrors);
      return;
    }

    const normalized = normalizeIndianMobile(phone);
    if (!normalized) {
      setFieldErrors({ phone: "Enter a valid 10-digit Indian mobile number." });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendOtp(normalized);
      if (closedRef.current) return;

      setNormalizedPhone(normalized);
      setOtp("");
      setStep("otp");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (authError) {
      setFormError(getApiErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const otpErrors = validateOtpInput(otp);
    if (otpErrors) {
      setFieldErrors(otpErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyOtp({
        phone: normalizedPhone,
        otp: otp.replace(/\D/g, ""),
      });
      if (closedRef.current) return;

      if (!result.requiresSignup) {
        finishAuth();
        return;
      }

      setSignupToken(result.signupToken ?? "");
      setStep("profile");
    } catch (authError) {
      setFormError(getApiErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();

    const profileErrors = validateProfileCompletion({
      firstName,
      lastName,
    });
    if (profileErrors) {
      setFieldErrors(profileErrors);
      return;
    }

    if (!signupToken && !normalizedPhone) {
      setFormError("Your verification session expired. Please request a new OTP.");
      setStep("phone");
      return;
    }

    setIsSubmitting(true);

    try {
      await completeSignup({
        ...(signupToken ? { signupToken } : {}),
        ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        firstName,
        lastName,
      });
      if (closedRef.current) return;
      finishAuth();
    } catch (authError) {
      setFormError(getApiErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (resendSeconds > 0 || isSubmitting || !normalizedPhone) return;

    setFormError("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await sendOtp(normalizedPhone);
      if (closedRef.current) return;
      setOtp("");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (authError) {
      setFormError(getApiErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    closedRef.current = true;
    closeLogin();
  }

  function goBack() {
    setFormError("");
    setFieldErrors({});
    if (step === "profile") {
      setStep("otp");
      return;
    }
    if (step === "otp") {
      setStep("phone");
      setOtp("");
      setResendSeconds(0);
    }
  }

  const submitLabel =
    step === "phone"
      ? isSubmitting
        ? "Sending OTP..."
        : "Send OTP"
      : step === "otp"
        ? isSubmitting
          ? "Verifying..."
          : "Verify OTP"
        : isSubmitting
          ? "Creating account..."
          : "Complete sign up";

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-100 bg-[#1a1a12]/45 backdrop-blur-[3px] transition-[opacity,backdrop-filter] duration-300 ease-out ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed inset-0 z-101 flex items-center justify-center p-4 sm:p-6 transition-[opacity,transform] duration-300 ease-out ${
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
            onClick={handleClose}
            className="absolute right-3 top-3 cursor-pointer rounded-xl p-2.5 text-[#424242] transition-colors hover:bg-[#f4f5eb] hover:text-[#1a1a1a]"
            aria-label="Close sign in"
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <div className="px-7 pb-8 pt-9 sm:px-9 sm:pt-10">
            <p id={descriptionId} className="sr-only">
              {stepDescription(step, normalizedPhone || phone)}
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
                {stepTitle(step)}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5c5c5c]">
                {stepDescription(step, normalizedPhone || phone)}
              </p>
            </div>

            {step !== "phone" ? (
              <button
                type="button"
                onClick={goBack}
                disabled={isSubmitting}
                className="mt-5 text-[14px] font-medium text-[#6f7600] transition-colors hover:text-[#4f5500] disabled:opacity-60"
              >
                ← Back
              </button>
            ) : null}

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                if (step === "phone") void handleSendOtp(event);
                else if (step === "otp") void handleVerifyOtp(event);
                else void handleCompleteProfile(event);
              }}
            >
              {step === "phone" ? (
                <div>
                  <label
                    htmlFor="auth-phone"
                    className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                  >
                    Mobile number
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-[#e3e5d8] bg-[#fafbf7] focus-within:border-[#9ea600] focus-within:bg-white focus-within:ring-[3px] focus-within:ring-[#9ea600]/20">
                    <span className="flex items-center border-r border-[#e3e5d8] px-4 text-[16px] text-[#666]">
                      +91
                    </span>
                    <input
                      id="auth-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      maxLength={14}
                      className="w-full bg-transparent px-4 py-3 text-[16px] text-[#222] outline-none"
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? "auth-phone-error" : undefined}
                    />
                  </div>
                  <FieldError message={fieldErrors.phone} />
                  {fieldErrors.phone ? (
                    <span id="auth-phone-error" className="sr-only">
                      {fieldErrors.phone}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {step === "otp" ? (
                <div>
                  <label
                    htmlFor="auth-otp"
                    className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                  >
                    One-time password
                  </label>
                  <input
                    id="auth-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
                    }
                    maxLength={OTP_LENGTH}
                    className={`${inputClassName} text-center tracking-[0.35em] ${
                      fieldErrors.otp ? inputErrorClassName : ""
                    }`}
                    aria-invalid={Boolean(fieldErrors.otp)}
                  />
                  <FieldError message={fieldErrors.otp} />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-[13px] text-[#666]">
                      Didn&apos;t receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleResendOtp()}
                      disabled={resendSeconds > 0 || isSubmitting}
                      className="text-[13px] font-medium text-[#6f7600] transition-colors hover:text-[#4f5500] disabled:cursor-not-allowed disabled:text-[#999]"
                    >
                      {resendSeconds > 0
                        ? `Resend in ${resendSeconds}s`
                        : "Resend OTP"}
                    </button>
                  </div>
                </div>
              ) : null}

              {step === "profile" ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="auth-first-name"
                        className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                      >
                        First name
                      </label>
                      <input
                        id="auth-first-name"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        maxLength={NAME_MAX_LENGTH}
                        className={`${inputClassName} ${
                          fieldErrors.firstName ? inputErrorClassName : ""
                        }`}
                        aria-invalid={Boolean(fieldErrors.firstName)}
                      />
                      <FieldError message={fieldErrors.firstName} />
                    </div>
                    <div>
                      <label
                        htmlFor="auth-last-name"
                        className="mb-1.5 block text-[13px] font-medium uppercase tracking-[0.06em] text-[#7a7a7a]"
                      >
                        Last name
                      </label>
                      <input
                        id="auth-last-name"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        maxLength={NAME_MAX_LENGTH}
                        className={`${inputClassName} ${
                          fieldErrors.lastName ? inputErrorClassName : ""
                        }`}
                        aria-invalid={Boolean(fieldErrors.lastName)}
                      />
                      <FieldError message={fieldErrors.lastName} />
                    </div>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#6f6f6f]">
                    You can add and verify an email later from your profile.
                  </p>
                </>
              ) : null}

              {formError ? (
                <p className="text-[13px] font-medium text-[#c14747]" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || status === "initializing"}
                className="mt-2 w-full cursor-pointer rounded-xl bg-[#9ea600] py-3.5 text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(158,166,0,0.35)] transition-[transform,box-shadow] hover:bg-[#8f9500] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
