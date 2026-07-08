import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import { formatCurrency, getStockLabel, resolveImageFallback } from "../storefront/commerce";
import { humanizeCartInvalidReason } from "../storefront/unavailableItem";
import type { ProductImageApiResponse } from "../storefront/types/api";
import type { AddCartLineInput, CartLineViewModel, CartViewModel } from "../cart/types";

type CartItemApiResponse = {
  productId: string;
  variantId: string;
  quantity: number;
  productTitle?: string | null;
  productSlug?: string | null;
  productImage?: string | null;
  category?: { title?: string | null; name?: string | null; slug?: string | null } | null;
  variantTitle?: string | null;
  variantSku?: string | null;
  size?: string | number | null;
  color?: string | number | null;
  unitPrice?: number | string | null;
  salePrice?: number | string | null;
  effectivePrice?: number | string | null;
  lineSubtotal?: number | string | null;
  lineTotal?: number | string | null;
  product?: {
    id?: string;
    title?: string | null;
    slug?: string | null;
    image?: ProductImageApiResponse | string | null;
    images?: ProductImageApiResponse[] | null;
    category?: { title?: string | null; name?: string | null } | null;
    available?: boolean | null;
    inStock?: boolean | null;
  } | null;
  variant?: {
    id?: string;
    title?: string | null;
    sku?: string | null;
    image?: ProductImageApiResponse | string | null;
    images?: ProductImageApiResponse[] | null;
    available?: boolean | null;
    inStock?: boolean | null;
    stockStatus?: string | null;
  } | null;
  available?: boolean | number | null;
  inStock?: boolean | null;
  invalidReason?: string | null;
  reason?: string | null;
  message?: string | null;
};

type CartApiResponse = {
  items?: CartItemApiResponse[];
  lines?: CartItemApiResponse[];
  invalidItems?: CartItemApiResponse[];
  subtotal?: number | string | null;
  totalItems?: number | string | null;
};

function coerceNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeApiImage(
  image: ProductImageApiResponse | string | null | undefined,
  fallbackAlt: string,
) {
  if (typeof image === "string") {
    return resolveImageFallback({ src: image, fallbackAlt });
  }

  return resolveImageFallback({
    src: image?.url ?? image?.src,
    alt: image?.alt,
    fallbackAlt,
  });
}

function pickImage(item: CartItemApiResponse, title: string) {
  const variantImage = item.variant?.image ?? item.variant?.images?.[0];
  const productImage =
    item.product?.image ??
    item.product?.images?.[0] ??
    item.productImage;
  return normalizeApiImage(variantImage ?? productImage, title);
}

function isAvailable(item: CartItemApiResponse) {
  if (typeof item.available === "number") return item.available > 0;

  return (
    item.available !== false &&
    item.product?.available !== false &&
    item.variant?.available !== false
  );
}

function isInStock(item: CartItemApiResponse) {
  if (!isAvailable(item)) return false;
  if (typeof item.inStock === "boolean") return item.inStock;
  if (typeof item.variant?.inStock === "boolean") return item.variant.inStock;
  if (typeof item.product?.inStock === "boolean") return item.product.inStock;
  return true;
}

function getAvailableQuantity(item: CartItemApiResponse) {
  if (typeof item.available === "number" && Number.isFinite(item.available)) {
    return Math.max(0, Math.floor(item.available));
  }
  return undefined;
}

function getVariantTitle(item: CartItemApiResponse) {
  const optionParts = [item.size, item.color]
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(String);

  return (
    item.variant?.title ??
    item.variantTitle ??
    item.variant?.sku ??
    item.variantSku ??
    (optionParts.length > 0 ? optionParts.join(" / ") : undefined)
  );
}

function normalizeCartLine(
  item: CartItemApiResponse,
  invalidReason?: string | null,
): CartLineViewModel {
  const title =
    item.product?.title?.trim() ||
    item.productTitle?.trim() ||
    "Unavailable product";
  const quantity = Math.max(0, Number(item.quantity) || 0);
  const effectivePrice =
    coerceNumber(item.effectivePrice) || coerceNumber(item.salePrice) || coerceNumber(item.unitPrice);
  const lineSubtotal =
    coerceNumber(item.lineSubtotal) ||
    coerceNumber(item.lineTotal) ||
    effectivePrice * quantity;
  const available = isAvailable(item);
  const inStock = isInStock(item);
  const availableQuantity = getAvailableQuantity(item);

  return {
    id: `${item.productId}:${item.variantId}`,
    productId: item.productId,
    variantId: item.variantId,
    productTitle: title,
    slug: item.product?.slug ?? item.productSlug ?? "",
    category:
      item.product?.category?.title ??
      item.product?.category?.name ??
      item.category?.title ??
      item.category?.name ??
      undefined,
    variantTitle: getVariantTitle(item),
    image: pickImage(item, title),
    quantity,
    availableQuantity,
    effectivePrice,
    formattedEffectivePrice: formatCurrency(effectivePrice),
    lineSubtotal,
    formattedLineSubtotal: formatCurrency(lineSubtotal),
    inStock,
    available,
    stockLabel: getStockLabel(inStock, availableQuantity),
    invalidReason:
      invalidReason ??
      humanizeCartInvalidReason(
        item.invalidReason ?? item.reason ?? item.message,
      ),
  };
}

export function normalizeCart(payload: CartApiResponse): CartViewModel {
  const validItems = payload.items ?? payload.lines ?? [];
  const invalidItems = payload.invalidItems ?? [];
  const lines = validItems.map((item) => normalizeCartLine(item));
  const invalidLines = invalidItems.map((item) =>
    normalizeCartLine(
      item,
      humanizeCartInvalidReason(
        item.invalidReason ??
          item.reason ??
          item.message ??
          "This item needs attention.",
      ) ?? "This item needs attention.",
    ),
  );
  const subtotal =
    coerceNumber(payload.subtotal) ||
    lines.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const itemCount =
    coerceNumber(payload.totalItems) ||
    [...lines, ...invalidLines].reduce((sum, line) => sum + line.quantity, 0);

  return {
    lines,
    invalidLines,
    itemCount,
    subtotal,
    formattedSubtotal: formatCurrency(subtotal),
    hasInvalidItems: invalidLines.length > 0,
  };
}

export async function getMyCart() {
  const result = await apiGet<CartApiResponse>("/cart/me", undefined, {
    auth: true,
  });
  return normalizeCart(result.data ?? {});
}

export async function addCartItem(input: AddCartLineInput) {
  const result = await apiPost<CartApiResponse>(
    "/cart/items",
    {
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    },
    { auth: true },
  );
  return normalizeCart(result.data ?? {});
}

export async function updateCartItemQuantity({
  productId,
  variantId,
  quantity,
}: {
  productId: string;
  variantId: string;
  quantity: number;
}) {
  const result = await apiPatch<CartApiResponse>(
    `/cart/items/${encodeURIComponent(productId)}/${encodeURIComponent(variantId)}`,
    { quantity },
    { auth: true },
  );
  return normalizeCart(result.data ?? {});
}

export async function removeCartItem({
  productId,
  variantId,
}: {
  productId: string;
  variantId: string;
}) {
  const result = await apiDelete<CartApiResponse>(
    `/cart/items/${encodeURIComponent(productId)}/${encodeURIComponent(variantId)}`,
    { auth: true },
  );
  return normalizeCart(result.data ?? {});
}

export async function clearMyCart() {
  const result = await apiDelete<CartApiResponse>("/cart/me", { auth: true });
  return normalizeCart(result.data ?? {});
}
