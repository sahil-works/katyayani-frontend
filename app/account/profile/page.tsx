"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { getApiErrorMessage } from "../../../lib/api/errors";

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
          Your mobile number is used to sign in. Verified email and phone
          management is coming soon.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] text-[#777]">Mobile number</p>
              <VerificationBadge verified={user.phoneVerified} />
            </div>
            <p className="mt-1 text-[18px] font-medium text-[#222]">
              {user.phone ? `+${user.phone}` : "Not provided"}
            </p>
          </div>
          <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] text-[#777]">Email</p>
              {user.email ? (
                <VerificationBadge verified={user.emailVerified} />
              ) : null}
            </div>
            <p className="mt-1 text-[18px] font-medium text-[#222]">
              {user.email ?? "Not added"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#dadcc8] bg-[#fbfcf8] p-6">
        <h2 className="text-[18px] font-semibold text-[#1f1f1f]">
          Saved addresses
        </h2>
        <p className="mt-1 text-[14px] text-[#777]">
          Save delivery addresses for faster checkout. Coming soon.
        </p>
      </div>
    </section>
  );
}
