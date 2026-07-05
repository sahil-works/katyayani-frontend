import { apiGet, apiPost } from "./client";
import { formatCurrency } from "../storefront/commerce";
import type { CartLineViewModel } from "../cart/types";

export type CheckoutAddress = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: "India";
};

type BackendCheckoutAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CheckoutLinePayload = {
  productId: string;
  variantId: string;
  quantity: number;
};

type QuoteLineApiResponse = {
  productId: string;
  variantId: string;
  quantity: number;
  productTitle?: string | null;
  variantSku?: string | null;
  size?: string | number | null;
  color?: string | number | null;
  effectivePrice?: number | string | null;
  lineSubtotal?: number | string | null;
  lineTotal?: number | string | null;
  available?: number | null;
  inStock?: boolean | null;
};

type UnavailableItemApiResponse = {
  productId?: string;
  variantId?: string;
  quantity?: number;
  title?: string | null;
  productTitle?: string | null;
  reason?: string | null;
  message?: string | null;
  available?: number | null;
};

type QuoteApiResponse = {
  quoteId?: string | null;
  valid?: boolean;
  lines?: QuoteLineApiResponse[];
  items?: QuoteLineApiResponse[];
  unavailableItems?: UnavailableItemApiResponse[];
  invalidItems?: UnavailableItemApiResponse[];
  subtotal?: number | string | null;
  shipping?: number | string | null;
  tax?: number | string | null;
  total?: number | string | null;
  currency?: "INR" | string | null;
  expiresAt?: string | null;
  message?: string | null;
};

type OrderApiResponse = {
  id?: string;
  orderId?: string;
  status?: string;
  paymentExpiresAt?: string | null;
};

type RazorpayPrepareApiResponse = {
  key?: string;
  keyId?: string;
  razorpayKeyId?: string;
  razorpayOrderId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string | number | boolean>;
  timeout?: number;
  checkout?: {
    keyId?: string;
    razorpayOrderId?: string;
    amountPaise?: number;
    amount?: number;
    currency?: string;
    orderId?: string;
    paymentId?: string;
  };
};

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";

type OrderStatusApiResponse = {
  orderId?: string;
  orderNumber?: string;
  orderStatus?: string;
  status?: OrderStatus | string;
  paymentStatus?: OrderStatus | string;
  retryable?: boolean;
  message?: string | null;
  expiresAt?: string | null;
  paymentExpiresAt?: string | null;
  paidAt?: string | null;
  total?: number | string | null;
  currency?: string | null;
};

export type QuoteViewModel = {
  quoteId?: string;
  valid: boolean;
  lines: CheckoutLinePayload[];
  unavailableItems: Array<{
    productId?: string;
    variantId?: string;
    title: string;
    reason: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  formattedSubtotal: string;
  formattedShipping: string;
  formattedTax: string;
  formattedTotal: string;
  expiresAt?: string;
  message?: string;
};

export type CreatedOrder = {
  id: string;
  status?: string;
  paymentExpiresAt?: string;
};

export type RazorpayPrepareViewModel = {
  key: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string | number | boolean>;
  timeout?: number;
  paymentId?: string;
};

export type OrderStatusViewModel = {
  orderId?: string;
  orderNumber?: string;
  status: OrderStatus;
  retryable: boolean;
  message: string;
  expiresAt?: string;
};

function coerceNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const parsed = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeQuoteLine(line: QuoteLineApiResponse): CheckoutLinePayload {
  return {
    productId: line.productId,
    variantId: line.variantId,
    quantity: Math.max(1, Number(line.quantity) || 1),
  };
}

function toBackendAddress(address: CheckoutAddress): BackendCheckoutAddress {
  return {
    fullName: [address.firstName, address.lastName].filter(Boolean).join(" ").trim(),
    phone: address.phone.trim(),
    line1: address.addressLine1.trim(),
    line2: address.addressLine2?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim(),
    country: "IN",
  };
}

function normalizeQuote(payload: QuoteApiResponse): QuoteViewModel {
  const lines = (payload.lines ?? payload.items ?? []).map(normalizeQuoteLine);
  const unavailableItems = [
    ...(payload.unavailableItems ?? []),
    ...(payload.invalidItems ?? []),
  ].map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    title:
      item.title?.trim() ||
      item.productTitle?.trim() ||
      (item.variantId ? `Variant ${item.variantId}` : "Unavailable item"),
    reason:
      item.reason?.trim() ||
      item.message?.trim() ||
      "This item is no longer available for checkout.",
  }));
  const subtotal = coerceNumber(payload.subtotal);
  const shipping = coerceNumber(payload.shipping);
  const tax = coerceNumber(payload.tax);
  const total = coerceNumber(payload.total) || subtotal + shipping + tax;
  const valid = payload.valid !== false && unavailableItems.length === 0;

  return {
    quoteId: payload.quoteId ?? undefined,
    valid,
    lines,
    unavailableItems,
    subtotal,
    shipping,
    tax,
    total,
    formattedSubtotal: formatCurrency(subtotal),
    formattedShipping: shipping <= 0 ? "Free" : formatCurrency(shipping),
    formattedTax: formatCurrency(tax),
    formattedTotal: formatCurrency(total),
    expiresAt: payload.expiresAt ?? undefined,
    message: payload.message ?? undefined,
  };
}

function normalizeOrder(payload: OrderApiResponse): CreatedOrder {
  const id = payload.id ?? payload.orderId;

  if (!id) {
    throw new Error("Order response did not include an order id.");
  }

  return {
    id,
    status: payload.status,
    paymentExpiresAt: payload.paymentExpiresAt ?? undefined,
  };
}

function normalizeRazorpayPrepare(
  payload: RazorpayPrepareApiResponse,
): RazorpayPrepareViewModel {
  const checkout = payload.checkout;
  const key = checkout?.keyId ?? payload.key ?? payload.keyId ?? payload.razorpayKeyId;
  const razorpayOrderId = checkout?.razorpayOrderId ?? payload.razorpayOrderId ?? payload.orderId;
  const amount = checkout?.amountPaise ?? checkout?.amount ?? payload.amount;

  if (!key || !razorpayOrderId || !amount) {
    throw new Error("Payment prepare response is missing Razorpay details.");
  }

  return {
    key,
    razorpayOrderId,
    amount,
    currency: checkout?.currency ?? payload.currency ?? "INR",
    name: payload.name ?? "Katyayani Designer Hub",
    description: payload.description,
    image: payload.image,
    prefill: payload.prefill,
    notes: payload.notes,
    timeout: payload.timeout,
    paymentId: checkout?.paymentId,
  };
}

function normalizeOrderStatus(payload: OrderStatusApiResponse): OrderStatusViewModel {
  const rawPaymentStatus = String(payload.paymentStatus ?? "").toUpperCase();
  const rawOrderStatus = String(payload.orderStatus ?? payload.status ?? "").toUpperCase();
  const rawStatus = rawPaymentStatus === "EXPIRED"
    ? "EXPIRED"
    : rawPaymentStatus === "CAPTURED" || rawOrderStatus === "PAID"
      ? "PAID"
      : rawOrderStatus === "PENDING_PAYMENT" ||
          rawPaymentStatus === "CREATED" ||
          rawPaymentStatus === "AUTHORIZED"
        ? "PENDING"
        : rawOrderStatus || rawPaymentStatus || "PENDING";
  const status: OrderStatus =
    rawStatus === "PAID" ||
    rawStatus === "FAILED" ||
    rawStatus === "CANCELLED" ||
    rawStatus === "EXPIRED"
      ? rawStatus
      : "PENDING";

  return {
    orderId: payload.orderId,
    orderNumber: payload.orderNumber,
    status,
    retryable: Boolean(payload.retryable),
    message:
      payload.message?.trim() ||
      (status === "PENDING"
        ? "Waiting for payment confirmation."
        : status === "EXPIRED"
          ? "The payment window expired."
          : "Payment status updated."),
    expiresAt: payload.paymentExpiresAt ?? payload.expiresAt ?? undefined,
  };
}

export function cartLinesToCheckoutPayload(
  lines: CartLineViewModel[],
): CheckoutLinePayload[] {
  return lines.map((line) => ({
    productId: line.productId,
    variantId: line.variantId,
    quantity: line.quantity,
  }));
}

export async function quoteOrder({
  lines,
  address,
}: {
  lines: CheckoutLinePayload[];
  address: CheckoutAddress;
}) {
  const result = await apiPost<QuoteApiResponse>(
    "/orders/quote",
    { items: lines, address: toBackendAddress(address) },
    { auth: true },
  );
  return normalizeQuote(result.data ?? {});
}

export async function createOrder({
  quote,
  address,
}: {
  quote: QuoteViewModel;
  address: CheckoutAddress;
}) {
  const result = await apiPost<OrderApiResponse>(
    "/orders",
    {
      items: quote.lines,
      address: toBackendAddress(address),
    },
    { auth: true },
  );
  return normalizeOrder(result.data ?? {});
}

export async function prepareRazorpayPayment({
  orderId,
  idempotencyKey,
}: {
  orderId: string;
  idempotencyKey: string;
}) {
  const result = await apiPost<RazorpayPrepareApiResponse>(
    `/payments/orders/${encodeURIComponent(orderId)}/prepare`,
    { idempotencyKey },
    { auth: true },
  );
  return normalizeRazorpayPrepare(result.data ?? {});
}

export async function getOrderStatus(orderId: string) {
  const result = await apiGet<OrderStatusApiResponse>(
    `/orders/${encodeURIComponent(orderId)}/status`,
    undefined,
    { auth: true },
  );
  return normalizeOrderStatus(result.data ?? {});
}
