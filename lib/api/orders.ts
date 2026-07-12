import { apiGet } from "./client";
import { coerceNumber } from "../storefront/commerce";

export type CustomerOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type CustomerOrderLine = {
  productId: string;
  variantId: string;
  productTitle: string;
  variantSku: string;
  size: string;
  color: string;
  unitPrice: number;
  salePrice: number | null;
  quantity: number;
  lineTotal: number;
};

export type CustomerOrderAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CustomerOrderPrice = {
  currency: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
};

export type CustomerOrderTimelineEvent = {
  type: string;
  at: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  items: CustomerOrderLine[];
  address: CustomerOrderAddress;
  price: CustomerOrderPrice;
  trackingId: string;
  courierName: string;
  paymentId: string | null;
  notes: string;
  timeline: CustomerOrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

type RawOrderLine = {
  productId?: string;
  variantId?: string;
  productTitle?: string;
  variantSku?: string;
  size?: string | number | null;
  color?: string | number | null;
  unitPrice?: number | string | null;
  salePrice?: number | string | null;
  quantity?: number | string | null;
  lineTotal?: number | string | null;
};

type RawOrder = {
  id?: string;
  _id?: string;
  orderId?: string;
  orderNumber?: string;
  status?: string;
  items?: RawOrderLine[];
  addressSnapshot?: Record<string, unknown>;
  priceSnapshot?: Record<string, unknown>;
  trackingId?: string | null;
  courierName?: string | null;
  paymentId?: string | null;
  notes?: string | null;
  timeline?: Array<{ type?: string; at?: string }>;
  createdAt?: string;
  updatedAt?: string;
};

const ORDER_STATUSES: CustomerOrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

function normalizeStatus(value: string | undefined): CustomerOrderStatus {
  const upper = String(value ?? "").toUpperCase();
  return (ORDER_STATUSES as string[]).includes(upper)
    ? (upper as CustomerOrderStatus)
    : "PENDING_PAYMENT";
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function normalizeLine(line: RawOrderLine): CustomerOrderLine {
  return {
    productId: str(line.productId),
    variantId: str(line.variantId),
    productTitle: str(line.productTitle) || "Item",
    variantSku: str(line.variantSku),
    size: str(line.size),
    color: str(line.color),
    unitPrice: coerceNumber(line.unitPrice),
    salePrice:
      line.salePrice == null ? null : coerceNumber(line.salePrice),
    quantity: Math.max(1, Number(line.quantity) || 1),
    lineTotal: coerceNumber(line.lineTotal),
  };
}

function normalizeAddress(
  raw: Record<string, unknown> | undefined,
): CustomerOrderAddress {
  const address = raw ?? {};
  return {
    fullName: str(address.fullName),
    phone: str(address.phone),
    line1: str(address.line1),
    line2: str(address.line2),
    city: str(address.city),
    state: str(address.state),
    postalCode: str(address.postalCode),
    country: str(address.country),
  };
}

function normalizePrice(
  raw: Record<string, unknown> | undefined,
): CustomerOrderPrice {
  const price = raw ?? {};
  return {
    currency: str(price.currency) || "INR",
    subtotal: coerceNumber(price.subtotal as number),
    tax: coerceNumber(price.tax as number),
    shipping: coerceNumber(price.shipping as number),
    discount: coerceNumber(price.discount as number),
    total: coerceNumber(price.total as number),
  };
}

export function normalizeOrder(raw: RawOrder): CustomerOrder {
  const id = str(raw.id ?? raw._id ?? raw.orderId);
  return {
    id,
    orderNumber: str(raw.orderNumber) || id,
    status: normalizeStatus(raw.status),
    items: (raw.items ?? []).map(normalizeLine),
    address: normalizeAddress(raw.addressSnapshot),
    price: normalizePrice(raw.priceSnapshot),
    trackingId: str(raw.trackingId),
    courierName: str(raw.courierName),
    paymentId: raw.paymentId ? str(raw.paymentId) : null,
    notes: str(raw.notes),
    timeline: (raw.timeline ?? []).map((event) => ({
      type: str(event.type),
      at: str(event.at),
    })),
    createdAt: str(raw.createdAt),
    updatedAt: str(raw.updatedAt),
  };
}

export async function getMyOrders({
  skip = 0,
  limit = 20,
}: { skip?: number; limit?: number } = {}): Promise<CustomerOrder[]> {
  const result = await apiGet<RawOrder[]>(
    "/orders/me",
    { skip, limit },
    { auth: true },
  );
  const data = Array.isArray(result.data) ? result.data : [];
  return data.map(normalizeOrder);
}

export async function getOrder(orderId: string): Promise<CustomerOrder> {
  const result = await apiGet<RawOrder>(
    `/orders/${encodeURIComponent(orderId)}`,
    undefined,
    { auth: true },
  );
  if (!result.data) {
    throw new Error("Order not found.");
  }
  return normalizeOrder(result.data);
}

const STATUS_META: Record<
  CustomerOrderStatus,
  { label: string; badge: string }
> = {
  PENDING_PAYMENT: {
    label: "Payment pending",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PAID: {
    label: "Confirmed",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  PROCESSING: {
    label: "Processing",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  PACKED: {
    label: "Packed",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  SHIPPED: {
    label: "Shipped",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
  DELIVERED: {
    label: "Delivered",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  REFUNDED: {
    label: "Refunded",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function orderStatusLabel(status: CustomerOrderStatus): string {
  return STATUS_META[status]?.label ?? status;
}

export function orderStatusBadgeClass(status: CustomerOrderStatus): string {
  return STATUS_META[status]?.badge ?? "border-gray-200 bg-gray-50 text-gray-600";
}
