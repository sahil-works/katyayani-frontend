import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressInput = {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
};

type AddressDto = Partial<Address> & { id?: string; _id?: string };

function normalizeAddress(dto: AddressDto): Address {
  const id = dto.id ?? dto._id;
  if (!id) {
    throw new Error("Address response did not include an id.");
  }
  return {
    id,
    label: dto.label ?? "",
    fullName: dto.fullName ?? "",
    phone: dto.phone ?? "",
    line1: dto.line1 ?? "",
    line2: dto.line2 ?? "",
    city: dto.city ?? "",
    state: dto.state ?? "",
    postalCode: dto.postalCode ?? "",
    country: dto.country ?? "IN",
    isDefault: Boolean(dto.isDefault),
  };
}

export function formatAddressLines(address: Address): string {
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export async function getAddresses(): Promise<Address[]> {
  const result = await apiGet<AddressDto[]>("/users/me/addresses", undefined, {
    auth: true,
  });
  return (result.data ?? []).map(normalizeAddress);
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const result = await apiPost<AddressDto>("/users/me/addresses", input, {
    auth: true,
  });
  return normalizeAddress(result.data);
}

export async function updateAddress(
  id: string,
  input: AddressInput,
): Promise<Address> {
  const result = await apiPatch<AddressDto>(
    `/users/me/addresses/${encodeURIComponent(id)}`,
    input,
    { auth: true },
  );
  return normalizeAddress(result.data);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const result = await apiPatch<AddressDto>(
    `/users/me/addresses/${encodeURIComponent(id)}/default`,
    undefined,
    { auth: true },
  );
  return normalizeAddress(result.data);
}

export async function deleteAddress(id: string): Promise<void> {
  await apiDelete(`/users/me/addresses/${encodeURIComponent(id)}`, {
    auth: true,
  });
}
