"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCartSidebar } from "../../../components/CartSidebar";
import {
  getOrderStatus,
  type OrderStatusViewModel,
} from "../../../lib/api/checkout";
import { getApiErrorMessage } from "../../../lib/api/errors";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function CheckoutSuccessHeader() {
  const { itemCount, openCart } = useCartSidebar();

  return (
    <header className="border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-[74px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={`${dancingScript.className} text-[30px] font-bold leading-none tracking-[0.01em] text-[#9ea600]`}
        >
          Katyayani Designer Hub
        </Link>
        <button
          type="button"
          onClick={openCart}
          aria-label={`Shopping cart, ${itemCount} items`}
          className="relative text-[#2f2f2f]"
        >
          <span className="text-[22px]">Cart</span>
          <span className="absolute -right-4 -top-2 min-w-4 rounded-full bg-black px-1 text-center text-[10px] font-semibold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </button>
      </div>
    </header>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const [status, setStatus] = useState<OrderStatusViewModel | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function loadStatus() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getOrderStatus(orderId);
        if (!cancelled) setStatus(result);
      } catch (statusError) {
        if (!cancelled) {
          setError(getApiErrorMessage(statusError));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isPaid = status?.status === "PAID";

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <CheckoutSuccessHeader />

      <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6">
        {!orderId ? (
          <section className="rounded-2xl border border-[#f0d4d4] bg-white px-6 py-8">
            <h1 className="text-[28px] font-semibold text-[#704040]">
              Order not found
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#666]">
              This confirmation link is missing an order reference.
            </p>
            <Link
              href="/collections"
              className="mt-6 inline-flex rounded-full bg-[#2f2f2f] px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Continue shopping
            </Link>
          </section>
        ) : isLoading ? (
          <section className="rounded-2xl border border-[#e3e5d8] bg-white px-6 py-8">
            <h1 className="text-[28px] font-semibold text-[#1f1f1f]">
              Confirming your order
            </h1>
            <p className="mt-2 text-[15px] text-[#666]">
              Loading payment confirmation...
            </p>
          </section>
        ) : error ? (
          <section className="rounded-2xl border border-[#f0d4d4] bg-white px-6 py-8">
            <h1 className="text-[28px] font-semibold text-[#704040]">
              Could not load order
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#666]">{error}</p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex rounded-full bg-[#2f2f2f] px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Return to checkout
            </Link>
          </section>
        ) : isPaid ? (
          <section className="rounded-2xl border border-[#cce8ce] bg-[#f3fbf3] px-6 py-8 text-[#245d2b]">
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#4d8f57]">
              Order confirmed
            </p>
            <h1 className="mt-2 text-[32px] font-semibold">Thank you for your order</h1>
            <p className="mt-3 text-[15px] leading-relaxed">
              {status?.message ?? "Your payment was successful and your order is confirmed."}
            </p>
            <p className="mt-3 text-[14px]">
              Order ID: {status?.orderNumber ?? status?.orderId ?? orderId}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex rounded-full bg-[#2f2f2f] px-5 py-2.5 text-[14px] font-semibold text-white"
              >
                Continue shopping
              </Link>
              <Link
                href="/account/my-orders"
                className="inline-flex rounded-full border border-[#245d2b]/20 bg-white px-5 py-2.5 text-[14px] font-semibold text-[#245d2b]"
              >
                View my orders
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-[#f0d4d4] bg-white px-6 py-8">
            <h1 className="text-[28px] font-semibold text-[#704040]">
              Payment not confirmed
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[#666]">
              {status?.message ??
                "We could not confirm payment for this order yet."}
            </p>
            <p className="mt-3 text-[14px] text-[#555]">
              Order ID: {status?.orderNumber ?? orderId}
            </p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex rounded-full bg-[#2f2f2f] px-5 py-2.5 text-[14px] font-semibold text-white"
            >
              Return to checkout
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f8f8f8]">
          <CheckoutSuccessHeader />
          <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6">
            <section className="rounded-2xl border border-[#e3e5d8] bg-white px-6 py-8">
              <h1 className="text-[28px] font-semibold text-[#1f1f1f]">
                Confirming your order
              </h1>
            </section>
          </div>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
