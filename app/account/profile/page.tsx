"use client";

import { useEffect, useState } from "react";
import { SavedAddressesSection } from "../../../components/account/SavedAddressesSection";
import { getApiErrorMessage } from "../../../lib/api/errors";
import {
  isValidEmail,
  normalizeIndianMobile,
  OTP_LENGTH,
} from "../../../lib/auth/validation";
import { useAuth } from "../../../providers/AuthProvider";

const RESEND_COOLDOWN_SECONDS = 30;

type ContactKind = "email" | "phone";

const contactInputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#dbddca] bg-white px-3.5 text-[15px] outline-none focus:border-[#9ea600] focus:ring-2 focus:ring-[#9ea600]/25";

function displayPhone(phone?: string) {
  if (!phone) return "Not added";
  const digits = phone.replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

function phoneToLocal(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function ContactEditor({
  kind,
  value,
  verified,
}: {
  kind: ContactKind;
  value?: string;
  verified: boolean;
}) {
  const {
    requestEmailOtp,
    confirmEmailOtp,
    requestPhoneOtp,
    confirmPhoneOtp,
  } = useAuth();

  const isEmail = kind === "email";
  const [mode, setMode] = useState<"idle" | "entering" | "verifying">("idle");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resend, setResend] = useState(0);

  useEffect(() => {
    if (resend <= 0) return;
    const timer = window.setInterval(() => {
      setResend((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resend]);

  function reset() {
    setMode("idle");
    setInput("");
    setPending("");
    setOtp("");
    setError("");
    setResend(0);
  }

  function startEditing() {
    setError("");
    setOtp("");
    setInput(isEmail ? value ?? "" : phoneToLocal(value));
    setMode("entering");
  }

  function normalizedTarget(raw: string): string | null {
    if (isEmail) return isValidEmail(raw) ? raw.trim().toLowerCase() : null;
    return normalizeIndianMobile(raw);
  }

  async function sendCode(target: string) {
    setBusy(true);
    setError("");
    try {
      if (isEmail) await requestEmailOtp(target);
      else await requestPhoneOtp(target);
      setPending(target);
      setOtp("");
      setMode("verifying");
      setResend(RESEND_COOLDOWN_SECONDS);
    } catch (sendError) {
      setError(getApiErrorMessage(sendError));
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    const target = normalizedTarget(input);
    if (!target) {
      setError(
        isEmail
          ? "Enter a valid email address."
          : "Enter a valid 10-digit Indian mobile number.",
      );
      return;
    }
    if (isEmail && value && target === value.toLowerCase() && verified) {
      setError("This email is already verified on your account.");
      return;
    }
    await sendCode(target);
  }

  async function handleVerify() {
    const digits = otp.replace(/\D/g, "");
    if (digits.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isEmail) await confirmEmailOtp(pending, digits);
      else await confirmPhoneOtp(pending, digits);
      reset();
    } catch (verifyError) {
      setError(getApiErrorMessage(verifyError));
    } finally {
      setBusy(false);
    }
  }

  const label = isEmail ? "Email" : "Mobile number";
  const shown = isEmail ? value ?? "Not added" : displayPhone(value);
  const actionLabel = isEmail
    ? value
      ? verified
        ? "Change email"
        : "Verify email"
      : "Add email"
    : "Change number";

  return (
    <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] text-[#777]">{label}</p>
        {isEmail && !value ? null : <VerificationBadge verified={verified} />}
      </div>

      {mode === "idle" ? (
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-[18px] font-medium text-[#222]">{shown}</p>
          <button
            type="button"
            onClick={startEditing}
            className="cursor-pointer whitespace-nowrap text-[14px] font-medium text-[#6f7600] transition-colors hover:text-[#4f5500]"
          >
            {actionLabel}
          </button>
        </div>
      ) : null}

      {mode === "entering" ? (
        <div className="mt-2">
          {isEmail ? (
            <input
              type="email"
              autoComplete="email"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="you@example.com"
              className={contactInputClass}
            />
          ) : (
            <div className="mt-1.5 flex h-11 overflow-hidden rounded-xl border border-[#dbddca] bg-white focus-within:border-[#9ea600] focus-within:ring-2 focus-within:ring-[#9ea600]/25">
              <span className="flex items-center border-r border-[#dbddca] px-3 text-[15px] text-[#666]">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="98765 43210"
                className="w-full bg-transparent px-3.5 text-[15px] outline-none"
              />
            </div>
          )}
          {error ? (
            <p className="mt-2 text-[13px] text-[#c14747]">{error}</p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void handleStart()}
              disabled={busy}
              className="cursor-pointer rounded-lg bg-[#9ea600] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#8f9500] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send code"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="cursor-pointer rounded-lg border border-[#dadcc8] px-4 py-2 text-[14px] font-medium text-[#333] transition-colors hover:bg-[#f2f3e9]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {mode === "verifying" ? (
        <div className="mt-2">
          <p className="text-[13px] text-[#666]">
            Enter the {OTP_LENGTH}-digit code sent to{" "}
            <span className="font-medium text-[#333]">
              {isEmail ? pending : displayPhone(pending)}
            </span>
            .
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
            }
            placeholder="000000"
            className={`${contactInputClass} text-center tracking-[0.35em]`}
          />
          {error ? (
            <p className="mt-2 text-[13px] text-[#c14747]">{error}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={busy}
              className="cursor-pointer rounded-lg bg-[#9ea600] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#8f9500] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => void sendCode(pending)}
              disabled={busy || resend > 0}
              className="cursor-pointer text-[13px] font-medium text-[#6f7600] transition-colors hover:text-[#4f5500] disabled:cursor-not-allowed disabled:text-[#999]"
            >
              {resend > 0 ? `Resend in ${resend}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="ml-auto cursor-pointer text-[13px] font-medium text-[#777] transition-colors hover:text-[#444]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          verified ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  if (!user) return null;

  function cancelEdit() {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setError("");
    setIsEditing(false);
  }

  async function handleSave() {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (!trimmedFirst || !trimmedLast) {
      setError("First and last name are required.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await updateProfile({ firstName: trimmedFirst, lastName: trimmedLast });
      setIsEditing(false);
      setSavedAt(Date.now());
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#e6e8d9] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-[#7b7b7b]">
              Account overview
            </p>
            <h1 className="mt-2 text-[32px] font-semibold leading-none text-[#1f1f1f]">
              Profile
            </h1>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer rounded-xl border border-[#dadcc8] px-5 py-2.5 text-[15px] font-medium text-[#4c5200] transition-colors hover:bg-[#f8f9f0]"
            >
              Edit profile
            </button>
          ) : null}
        </div>

        {savedAt > 0 && !isEditing ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-700">
            Profile updated successfully.
          </div>
        ) : null}

        {isEditing ? (
          <div className="mt-7 max-w-xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[13px] font-medium text-[#555]">
                  First name
                </span>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#dbddca] bg-white px-3.5 text-[15px] outline-none focus:border-[#9ea600] focus:ring-2 focus:ring-[#9ea600]/25"
                  placeholder="First name"
                  maxLength={80}
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-[#555]">
                  Last name
                </span>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#dbddca] bg-white px-3.5 text-[15px] outline-none focus:border-[#9ea600] focus:ring-2 focus:ring-[#9ea600]/25"
                  placeholder="Last name"
                  maxLength={80}
                />
              </label>
            </div>

            {error ? (
              <p className="mt-3 text-[14px] text-[#c14747]">{error}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="cursor-pointer rounded-xl bg-[#9ea600] px-6 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#8f9500] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="cursor-pointer rounded-xl border border-[#dadcc8] px-6 py-2.5 text-[15px] font-medium text-[#333] transition-colors hover:bg-[#f8f9f0]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
              <p className="text-[13px] text-[#777]">First name</p>
              <p className="mt-1 text-[18px] font-medium text-[#222]">
                {user.firstName ?? "Not provided"}
              </p>
            </div>
            <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
              <p className="text-[13px] text-[#777]">Last name</p>
              <p className="mt-1 text-[18px] font-medium text-[#222]">
                {user.lastName ?? "Not provided"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#e6e8d9] bg-white p-6 sm:p-8">
        <h2 className="text-[20px] font-semibold text-[#1f1f1f]">
          Contact details
        </h2>
        <p className="mt-1 text-[14px] text-[#777]">
          Your mobile number is used to sign in. Changing your number or email
          requires a one-time verification code.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ContactEditor
            kind="phone"
            value={user.phone}
            verified={user.phoneVerified}
          />
          <ContactEditor
            kind="email"
            value={user.email}
            verified={user.emailVerified}
          />
        </div>
      </div>

      <SavedAddressesSection />
    </section>
  );
}
