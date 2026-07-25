"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAddress,
  deleteAddress,
  formatAddressLines,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type Address,
} from "../../lib/api/addresses";
import { getApiErrorMessage } from "../../lib/api/errors";
import {
  addressToFormValues,
  EMPTY_ADDRESS_FORM,
  formValuesToAddressInput,
  type AddressFormValues,
} from "../../lib/addresses/mappers";
import { useAuth } from "../../providers/AuthProvider";

const fieldClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#f0d0de] bg-white px-3.5 text-[15px] outline-none focus:border-[#ea206d] focus:ring-2 focus:ring-[#ea206d]/25";

function AddressForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  busy,
}: {
  initial: AddressFormValues;
  submitLabel: string;
  onSubmit: (values: AddressFormValues) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");

  function updateField<K extends keyof AddressFormValues>(
    key: K,
    value: AddressFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !values.fullName.trim() ||
      !values.phone.trim() ||
      !values.line1.trim() ||
      !values.city.trim() ||
      !values.state.trim() ||
      !values.postalCode.trim()
    ) {
      setError("Please fill in all required address fields.");
      return;
    }
    setError("");
    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[13px] font-medium text-[#555]">
            Label <span className="font-normal text-[#999]">(optional)</span>
          </span>
          <input
            value={values.label}
            onChange={(event) => updateField("label", event.target.value)}
            placeholder="Home, Office..."
            maxLength={40}
            className={fieldClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[13px] font-medium text-[#555]">Full name</span>
          <input
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            required
            maxLength={120}
            className={fieldClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[13px] font-medium text-[#555]">Phone</span>
          <input
            type="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            required
            minLength={8}
            maxLength={20}
            className={fieldClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[13px] font-medium text-[#555]">Address line 1</span>
          <input
            value={values.line1}
            onChange={(event) => updateField("line1", event.target.value)}
            required
            maxLength={200}
            className={fieldClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[13px] font-medium text-[#555]">
            Address line 2 <span className="font-normal text-[#999]">(optional)</span>
          </span>
          <input
            value={values.line2}
            onChange={(event) => updateField("line2", event.target.value)}
            maxLength={200}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-[#555]">City</span>
          <input
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            required
            maxLength={80}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-[#555]">State</span>
          <input
            value={values.state}
            onChange={(event) => updateField("state", event.target.value)}
            required
            maxLength={80}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium text-[#555]">PIN code</span>
          <input
            value={values.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
            required
            minLength={3}
            maxLength={20}
            className={fieldClass}
          />
        </label>
        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={values.isDefault}
            onChange={(event) => updateField("isDefault", event.target.checked)}
            className="size-4 rounded border-[#f0d0de] text-[#ea206d] focus:ring-[#ea206d]"
          />
          <span className="text-[14px] text-[#444]">Set as default</span>
        </label>
      </div>

      {error ? <p className="text-[13px] text-[#c14747]">{error}</p> : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer rounded-lg bg-[#ea206d] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#d01b60] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="cursor-pointer rounded-lg border border-[#e8c8d6] px-4 py-2 text-[14px] font-medium text-[#333] transition-colors hover:bg-[#fce8f0]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function SavedAddressesSection() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<AddressFormValues>(
    EMPTY_ADDRESS_FORM,
  );

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getAddresses();
      setAddresses(list);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  function startAdd() {
    const fullName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.name ||
      "";
    setFormInitial({
      ...EMPTY_ADDRESS_FORM,
      fullName,
      phone: user?.phone ?? "",
      isDefault: addresses.length === 0,
    });
    setEditingId(null);
    setFormMode("add");
  }

  function startEdit(address: Address) {
    setFormInitial(addressToFormValues(address));
    setEditingId(address.id);
    setFormMode("edit");
  }

  function cancelForm() {
    setFormMode("none");
    setEditingId(null);
    setFormInitial(EMPTY_ADDRESS_FORM);
  }

  async function handleCreate(values: AddressFormValues) {
    setBusyId("create");
    try {
      await createAddress(formValuesToAddressInput(values));
      cancelForm();
      await loadAddresses();
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdate(values: AddressFormValues) {
    if (!editingId) return;
    setBusyId(editingId);
    try {
      await updateAddress(editingId, formValuesToAddressInput(values));
      cancelForm();
      await loadAddresses();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setBusyId(id);
    try {
      await setDefaultAddress(id);
      await loadAddresses();
    } catch (defaultError) {
      setError(getApiErrorMessage(defaultError));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this saved address?")) return;
    setBusyId(id);
    try {
      await deleteAddress(id);
      if (editingId === id) cancelForm();
      await loadAddresses();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-[#f5d6e4] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1f1f1f]">
            Saved addresses
          </h2>
          <p className="mt-1 text-[14px] text-[#777]">
            Manage delivery addresses for faster checkout.
          </p>
        </div>
        {formMode === "none" ? (
          <button
            type="button"
            onClick={startAdd}
            className="cursor-pointer rounded-xl border border-[#e8c8d6] px-5 py-2.5 text-[15px] font-medium text-[#9a1548] transition-colors hover:bg-[#fdf0f5]"
          >
            Add address
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] px-4 py-3 text-[14px] text-[#704040]">
          {error}
        </p>
      ) : null}

      {formMode === "add" ? (
        <AddressForm
          key="add"
          initial={formInitial}
          submitLabel="Save address"
          onSubmit={handleCreate}
          onCancel={cancelForm}
          busy={busyId === "create"}
        />
      ) : null}

      {formMode === "edit" ? (
        <AddressForm
          key={editingId ?? "edit"}
          initial={formInitial}
          submitLabel="Update address"
          onSubmit={handleUpdate}
          onCancel={cancelForm}
          busy={Boolean(editingId && busyId === editingId)}
        />
      ) : null}

      {loading ? (
        <div className="mt-5 space-y-3">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="h-24 animate-pulse rounded-xl border border-[#eceee0] bg-[#fefafc]"
            />
          ))}
        </div>
      ) : addresses.length === 0 && formMode === "none" ? (
        <div className="mt-5 rounded-xl border border-dashed border-[#e8c8d6] bg-[#fefafc] px-4 py-8 text-center">
          <p className="text-[15px] text-[#555]">No saved addresses yet.</p>
          <button
            type="button"
            onClick={startAdd}
            className="mt-4 cursor-pointer rounded-lg bg-[#ea206d] px-5 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#d01b60]"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-xl border border-[#eceee0] bg-[#fefafc] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {address.label ? (
                      <span className="text-[15px] font-semibold text-[#222]">
                        {address.label}
                      </span>
                    ) : null}
                    {address.isDefault ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[12px] font-medium text-emerald-700">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[15px] font-medium text-[#222]">
                    {address.fullName}
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#555]">
                    {formatAddressLines(address)}
                  </p>
                  <p className="mt-1 text-[14px] text-[#666]">{address.phone}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <button
                      type="button"
                      onClick={() => void handleSetDefault(address.id)}
                      disabled={busyId === address.id}
                      className="cursor-pointer rounded-lg border border-[#e8c8d6] px-3 py-1.5 text-[13px] font-medium text-[#9a1548] transition-colors hover:bg-[#fce8f0] disabled:opacity-60"
                    >
                      Make default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    disabled={busyId === address.id}
                    className="cursor-pointer rounded-lg border border-[#e8c8d6] px-3 py-1.5 text-[13px] font-medium text-[#333] transition-colors hover:bg-[#fce8f0] disabled:opacity-60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(address.id)}
                    disabled={busyId === address.id}
                    className="cursor-pointer rounded-lg border border-[#f0d4d4] px-3 py-1.5 text-[13px] font-medium text-[#a04444] transition-colors hover:bg-[#fff7f7] disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
