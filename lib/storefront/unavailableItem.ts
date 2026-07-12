type UnavailableItemLike = {
  productTitle?: string | null;
  title?: string | null;
  variantTitle?: string | null;
  variantSku?: string | null;
  variantLabel?: string | null;
  size?: string | number | null;
  color?: string | number | null;
};

const REASON_LABELS: Record<string, string> = {
  PRODUCT_UNAVAILABLE: "This product is no longer available.",
  VARIANT_UNAVAILABLE: "This variant is no longer available.",
  INSUFFICIENT_STOCK: "Not enough stock for the requested quantity.",
};

function isMongoObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

export function humanizeUnavailableReason(
  reason?: string | null,
  available?: number | null,
): string {
  const code = reason?.trim().toUpperCase() ?? "";

  if (code === "INSUFFICIENT_STOCK") {
    return typeof available === "number"
      ? `Only ${available} left in stock.`
      : REASON_LABELS.INSUFFICIENT_STOCK;
  }

  if (REASON_LABELS[code]) {
    return REASON_LABELS[code];
  }

  const trimmed = reason?.trim();
  if (!trimmed) {
    return "This item is no longer available for checkout.";
  }

  if (isMongoObjectId(trimmed) || /^Variant [a-f0-9]{24}$/i.test(trimmed)) {
    return "This item is no longer available for checkout.";
  }

  return trimmed;
}

export function resolveUnavailableItemTitle(item: UnavailableItemLike): string {
  const productTitle = item.productTitle?.trim() || item.title?.trim();
  const variantLabel =
    item.variantLabel?.trim() ||
    item.variantTitle?.trim() ||
    [item.variantSku, item.size, item.color]
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map(String)
      .join(" / ")
      .trim();

  if (productTitle && variantLabel) {
    return `${productTitle} (${variantLabel})`;
  }

  if (productTitle) {
    return productTitle;
  }

  if (variantLabel) {
    return variantLabel;
  }

  return "Unavailable item";
}

export function humanizeCartInvalidReason(reason?: string | null): string | undefined {
  if (!reason?.trim()) return undefined;

  const code = reason.trim().toUpperCase();
  if (REASON_LABELS[code]) {
    return REASON_LABELS[code];
  }

  if (isMongoObjectId(code) || /^VARIANT [A-F0-9]{24}$/i.test(reason.trim())) {
    return "This item needs attention.";
  }

  return humanizeUnavailableReason(reason);
}
