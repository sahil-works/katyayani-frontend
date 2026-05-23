import type { SeoViewModel, StorefrontImageViewModel } from "./types/viewModels";

export const PRODUCT_IMAGE_FALLBACK = "/assets/images/banner-one.png";
export const CATEGORY_IMAGE_FALLBACK = "/assets/images/banner-two.png";

export function coerceNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;

  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number, currency: "INR" = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function renderPriceRange(values: number[]) {
  const normalizedValues = values
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);

  if (normalizedValues.length === 0) return formatCurrency(0);

  const min = normalizedValues[0];
  const max = normalizedValues[normalizedValues.length - 1];

  return min === max
    ? formatCurrency(min)
    : `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function getStockLabel(inStock: boolean, stockQuantity?: number) {
  if (!inStock) return "Sold out";
  if (typeof stockQuantity === "number" && stockQuantity <= 5) {
    return "Low stock";
  }
  return "In stock";
}

export function resolveImageFallback({
  src,
  alt,
  fallbackSrc = PRODUCT_IMAGE_FALLBACK,
  fallbackAlt = "Katyayani Designer Hub product image",
}: {
  src?: string | null;
  alt?: string | null;
  fallbackSrc?: string;
  fallbackAlt?: string;
}): StorefrontImageViewModel {
  return {
    src: src?.trim() || fallbackSrc,
    alt: alt?.trim() || fallbackAlt,
  };
}

export function resolveSeoFallback({
  title,
  description,
  fallbackTitle,
  fallbackDescription = "Explore premium ethnic wear at Katyayani Designer Hub.",
}: {
  title?: string | null;
  description?: string | null;
  fallbackTitle: string;
  fallbackDescription?: string;
}): SeoViewModel {
  return {
    title: title?.trim() || fallbackTitle,
    description: description?.trim() || fallbackDescription,
  };
}
