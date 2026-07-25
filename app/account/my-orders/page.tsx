"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getMyOrders,
  orderStatusBadgeClass,
  orderStatusLabel,
  type CustomerOrder,
} from "../../../lib/api/orders";
import { formatCurrency } from "../../../lib/storefront/commerce";
import { getApiErrorMessage } from "../../../lib/api/errors";
import { useAuth } from "../../../providers/AuthProvider";

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function itemSummary(order: CustomerOrder) {
  const [first, ...rest] = order.items;
  if (!first) return "No items";
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
  if (rest.length === 0) {
    return `${first.productTitle} × ${first.quantity}`;
  }
  return `${first.productTitle} + ${rest.length} more · ${totalUnits} items`;
}

export default function AccountOrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getMyOrders({ limit: 50 });
        if (!cancelled) setOrders(result);
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
  }, [isAuthenticated]);

  return (
    <section className="rounded-2xl border border-[#f5d6e4] bg-white p-6 sm:p-8">
      <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-[#7b7b7b]">
        Purchases
      </p>
      <h1 className="mt-2 text-[32px] font-semibold leading-none text-[#1f1f1f]">
        My Orders
      </h1>

      {isLoading ? (
        <div className="mt-7 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-[#f3f4ea]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-7 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] p-5">
          <p className="text-[15px] text-[#704040]">{error}</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="mt-7 rounded-xl border border-[#eceee0] bg-[#fefafc] p-6">
          <h2 className="text-[20px] font-semibold text-[#222]">
            No orders yet
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#666]">
            When you place an order it will appear here with live status and
            tracking details.
          </p>
          <Link
            href="/collections"
            className="mt-5 inline-flex rounded-xl bg-[#ea206d] px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#d01b60]"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-7 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/my-orders/${order.id}`}
                className="flex flex-col gap-3 rounded-xl border border-[#eceee0] bg-[#fefafc] p-4 transition-colors hover:border-[#e8c8d6] hover:bg-[#f6f8ee] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[15px] font-semibold text-[#1f1f1f]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${orderStatusBadgeClass(order.status)}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[14px] text-[#666]">
                    {itemSummary(order)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#8a8a8a]">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-[17px] font-semibold text-[#1f1f1f]">
                    {formatCurrency(order.price.total)}
                  </span>
                  <span className="text-[#ea206d]" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
