import type { Address, AddressInput } from "../api/addresses";
import type { CheckoutAddress } from "../api/checkout";

export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function addressToCheckout(
  address: Address,
  email: string,
): CheckoutAddress {
  const { firstName, lastName } = splitFullName(address.fullName);
  return {
    email,
    phone: address.phone,
    firstName,
    lastName,
    addressLine1: address.line1,
    addressLine2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: "India",
  };
}

export function checkoutToAddressInput(
  address: CheckoutAddress,
  options?: { label?: string; isDefault?: boolean },
): AddressInput {
  return {
    label: options?.label ?? "",
    fullName: [address.firstName, address.lastName].filter(Boolean).join(" ").trim(),
    phone: address.phone.trim(),
    line1: address.addressLine1.trim(),
    line2: address.addressLine2?.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim(),
    country: "IN",
    isDefault: options?.isDefault,
  };
}

export type AddressFormValues = {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export function addressToFormValues(address: Address): AddressFormValues {
  return {
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    isDefault: address.isDefault,
  };
}

export function formValuesToAddressInput(values: AddressFormValues): AddressInput {
  return {
    label: values.label.trim() || undefined,
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    line1: values.line1.trim(),
    line2: values.line2.trim() || undefined,
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: "IN",
    isDefault: values.isDefault,
  };
}

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  label: "",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};
