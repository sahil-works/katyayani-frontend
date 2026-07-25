"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getOrder,
  orderStatusBadgeClass,
  orderStatusLabel,
  type CustomerOrder,
} from "../../../../lib/api/orders";
import { formatCurrency } from "../../../../lib/storefront/commerce";
import { getApiErrorMessage } from "../../../../lib/api/errors";
import { useAuth } from "../../../../providers/AuthProvider";

function formatDateTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function PriceRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        strong
          ? "border-t border-[#eceee0] pt-3 text-[16px] font-semibold text-[#1f1f1f]"
          : "text-[14px] text-[#555]"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !orderId) return;

    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getOrder(orderId);
        if (!cancelled) setOrder(result);
      } catch (loadError) {
        if (!cancelled) setError(getApiErrorMessage(loadError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, orderId]);

  return (
    <section className="space-y-6">
      <Link
        href="/account/my-orders"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#6f7600] hover:underline"
      >
        <span aria-hidden>←</span> Back to my orders
      </Link>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 animate-pulse rounded-2xl bg-[#f3f4ea]" />
          <div className="h-64 animate-pulse rounded-2xl bg-[#f3f4ea]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#f0d4d4] bg-[#fff7f7] p-6">
          <h1 className="text-[22px] font-semibold text-[#704040]">
            Could not load order
          </h1>
          <p className="mt-2 text-[15px] text-[#666]">{error}</p>
        </div>
      ) : !order ? null : (
        <>
          <div className="rounded-2xl border border-[#f5d6e4] bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-[#7b7b7b]">
                  Order
                </p>
                <h1 className="mt-2 text-[28px] font-semibold leading-none text-[#1f1f1f]">
                  {order.orderNumber}
                </h1>
                <p className="mt-2 text-[14px] text-[#8a8a8a]">
                  Placed on {formatDateTime(order.createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[13px] font-medium ${orderStatusBadgeClass(order.status)}`}
              >
                {orderStatusLabel(order.status)}
              </span>
            </div>

            {order.trackingId || order.courierName ? (
              <div className="mt-5 rounded-xl border border-[#dfe7d5] bg-[#f4f8ee] p-4">
                <p className="text-[13px] font-medium text-[#9a1548]">
                  Shipment
                </p>
                <p className="mt-1 text-[15px] text-[#333]">
                  {order.courierName || "Courier"}
                  {order.trackingId ? ` · ${order.trackingId}` : ""}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-[#f5d6e4] bg-white p-6 sm:p-8">
              <h2 className="text-[18px] font-semibold text-[#1f1f1f]">Items</h2>
              <ul className="mt-4 divide-y divide-[#eceee0]">
                {order.items.map((item) => (
                  <li
                    key={`${item.variantId}-${item.variantSku}`}
                    className="flex items-start justify-between gap-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-[#222]">
                        {item.productTitle}
                      </p>
                      <p className="mt-0.5 text-[13px] text-[#8a8a8a]">
                        {[item.size, item.color].filter(Boolean).join(" / ") ||
                          item.variantSku}{" "}
                        × {item.quantity}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-[15px] font-semibold text-[#1f1f1f]">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[#f5d6e4] bg-white p-6">
                <h2 className="text-[18px] font-semibold text-[#1f1f1f]">
                  Payment summary
                </h2>
                <div className="mt-4 space-y-2.5">
                  <PriceRow
                    label="Subtotal"
                    value={formatCurrency(order.price.subtotal)}
                  />
                  <PriceRow
                    label="Shipping"
                    value={
                      order.price.shipping > 0
                        ? formatCurrency(order.price.shipping)
                        : "Free"
                    }
                  />
                  {order.price.tax > 0 ? (
                    <PriceRow
                      label="Tax"
                      value={formatCurrency(order.price.tax)}
                    />
                  ) : null}
                  {order.price.discount > 0 ? (
                    <PriceRow
                      label="Discount"
                      value={`- ${formatCurrency(order.price.discount)}`}
                    />
                  ) : null}
                  <PriceRow
                    label="Total"
                    value={formatCurrency(order.price.total)}
                    strong
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#f5d6e4] bg-white p-6">
                <h2 className="text-[18px] font-semibold text-[#1f1f1f]">
                  Delivery address
                </h2>
                <div className="mt-3 space-y-0.5 text-[14px] text-[#555]">
                  <p className="font-medium text-[#222]">
                    {order.address.fullName}
                  </p>
                  <p>{order.address.phone}</p>
                  <p>
                    {[order.address.line1, order.address.line2]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    {[
                      order.address.city,
                      order.address.state,
                      order.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>{order.address.country}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
