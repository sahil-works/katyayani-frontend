"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCartSidebar } from "../../../components/CartSidebar";
import {
  getOrderStatus,
  type OrderStatusViewModel,
} from "../../../lib/api/checkout";
import { getOrder, type CustomerOrder } from "../../../lib/api/orders";
import { formatCurrency } from "../../../lib/storefront/commerce";
import { getApiErrorMessage } from "../../../lib/api/errors";
import { useAuth } from "../../../providers/AuthProvider";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const MAX_POLLS = 8;
const POLL_INTERVAL_MS = 3000;

function CheckoutSuccessHeader() {
  const { itemCount, openCart } = useCartSidebar();

  return (
    <header className="border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-[74px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={`${dancingScript.className} text-[30px] font-bold leading-none tracking-[0.01em] text-[#ea206d]`}
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f7f2]">
      <CheckoutSuccessHeader />
      <div className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6">
        {children}
      </div>
    </main>
  );
}

function SuccessIcon() {
  return (
    <span className="relative flex size-16 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-[#cfe9d2]" />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-[#2f9e44] text-[32px] text-white">
        ✓
      </span>
    </span>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";
  const { status: authStatus, isAuthenticated } = useAuth();

  const [statusResult, setStatusResult] = useState<OrderStatusViewModel | null>(
    null,
  );
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId) return;
    if (authStatus === "initializing") return;
    if (!isAuthenticated) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    attemptsRef.current = 0;

    async function poll() {
      setIsLoading(true);
      setError("");
      try {
        const result = await getOrderStatus(orderId);
        if (cancelled) return;
        setStatusResult(result);

        if (result.status === "PENDING" && attemptsRef.current < MAX_POLLS) {
          attemptsRef.current += 1;
          timer = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        if (result.status === "PAID") {
          try {
            const full = await getOrder(orderId);
            if (!cancelled) setOrder(full);
          } catch {
            /* summary is optional; status view is enough */
          }
        }
        if (!cancelled) setIsLoading(false);
      } catch (pollError) {
        if (!cancelled) {
          setError(getApiErrorMessage(pollError));
          setIsLoading(false);
        }
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, authStatus, isAuthenticated]);

  const displayOrderNumber =
    order?.orderNumber ?? statusResult?.orderNumber ?? orderId;

  if (!orderId) {
    return (
      <Shell>
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
      </Shell>
    );
  }

  if (authStatus !== "initializing" && !isAuthenticated) {
    return (
      <Shell>
        <section className="rounded-2xl border border-[#f0d4e0] bg-white px-6 py-8">
          <h1 className="text-[26px] font-semibold text-[#1f1f1f]">
            Sign in to view this order
          </h1>
          <p className="mt-2 text-[15px] text-[#666]">
            Please sign in with the mobile number used at checkout.
          </p>
          <Link
            href="/account/my-orders"
            className="mt-6 inline-flex rounded-full bg-[#ea206d] px-5 py-2.5 text-[14px] font-semibold text-white"
          >
            Go to my orders
          </Link>
        </section>
      </Shell>
    );
  }

  if (authStatus === "initializing" || isLoading) {
    return (
      <Shell>
        <section className="rounded-2xl border border-[#f0d4e0] bg-white px-6 py-10 text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-[#f5d6e4] border-t-[#ea206d]" />
          <h1 className="mt-5 text-[26px] font-semibold text-[#1f1f1f]">
            Confirming your order
          </h1>
          <p className="mt-2 text-[15px] text-[#666]">
            Hold on while we confirm your payment...
          </p>
        </section>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <section className="rounded-2xl border border-[#f0d4d4] bg-white px-6 py-8">
          <h1 className="text-[26px] font-semibold text-[#704040]">
            Could not load order
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#666]">{error}</p>
          <Link
            href="/account/my-orders"
            className="mt-6 inline-flex rounded-full bg-[#2f2f2f] px-5 py-2.5 text-[14px] font-semibold text-white"
          >
            View my orders
          </Link>
        </section>
      </Shell>
    );
  }

  const status = statusResult?.status ?? "PENDING";

  if (status === "PAID") {
    return (
      <Shell>
        <section className="overflow-hidden rounded-2xl border border-[#cce8ce] bg-white">
          <div className="flex flex-col items-center bg-[#f3fbf3] px-6 py-10 text-center">
            <SuccessIcon />
            <p className="mt-5 text-[13px] font-medium uppercase tracking-[0.08em] text-[#4d8f57]">
              Payment successful
            </p>
            <h1 className="mt-2 text-[30px] font-semibold text-[#1f5b28]">
              Thank you for your order
            </h1>
            <p className="mt-2 text-[15px] text-[#3f6b46]">
              Order <span className="font-semibold">{displayOrderNumber}</span>{" "}
              is confirmed. A confirmation has been sent on WhatsApp.
            </p>
          </div>

          {order ? (
            <div className="border-t border-[#f5d6e4] px-6 py-6">
              <ul className="divide-y divide-[#eceee0]">
                {order.items.slice(0, 4).map((item) => (
                  <li
                    key={`${item.variantId}-${item.variantSku}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-[#222]">
                        {item.productTitle}
                      </p>
                      <p className="text-[12px] text-[#8a8a8a]">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-[14px] font-semibold text-[#1f1f1f]">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
              {order.items.length > 4 ? (
                <p className="mt-2 text-[13px] text-[#8a8a8a]">
                  + {order.items.length - 4} more item(s)
                </p>
              ) : null}
              <div className="mt-4 flex items-center justify-between border-t border-[#eceee0] pt-4">
                <span className="text-[15px] font-semibold text-[#1f1f1f]">
                  Total paid
                </span>
                <span className="text-[18px] font-semibold text-[#1f1f1f]">
                  {formatCurrency(order.price.total)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-[#f5d6e4] px-6 py-6">
            <Link
              href="/account/my-orders"
              className="inline-flex rounded-full bg-[#ea206d] px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#d01b60]"
            >
              View my orders
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-[#e8c8d6] bg-white px-6 py-2.5 text-[14px] font-semibold text-[#333] transition-colors hover:bg-[#fdf0f5]"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </Shell>
    );
  }

  if (status === "PENDING") {
    return (
      <Shell>
        <section className="rounded-2xl border border-[#f0e2c4] bg-[#fdfaf1] px-6 py-8 text-center">
          <h1 className="text-[26px] font-semibold text-[#7a5c1e]">
            Still confirming your payment
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#6b6b5a]">
            This can take a moment. Your order{" "}
            <span className="font-semibold">{displayOrderNumber}</span> will
            update automatically once payment is confirmed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/account/my-orders"
              className="inline-flex rounded-full bg-[#ea206d] px-6 py-2.5 text-[14px] font-semibold text-white"
            >
              View my orders
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex rounded-full border border-[#e8c8d6] bg-white px-6 py-2.5 text-[14px] font-semibold text-[#333] hover:bg-[#fdf0f5]"
            >
              Refresh status
            </button>
          </div>
        </section>
      </Shell>
    );
  }

  const failureMessage =
    status === "EXPIRED"
      ? "The payment window expired before we could confirm your payment."
      : statusResult?.message ??
        "We could not confirm payment for this order. You have not been charged if the payment did not go through.";

  return (
    <Shell>
      <section className="rounded-2xl border border-[#f0d4d4] bg-white px-6 py-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#fbe4e4] text-[30px] text-[#c14747]">
          !
        </span>
        <h1 className="mt-5 text-[28px] font-semibold text-[#704040]">
          Payment not completed
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#666]">
          {failureMessage}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/checkout"
            className="inline-flex rounded-full bg-[#2f2f2f] px-6 py-2.5 text-[14px] font-semibold text-white"
          >
            Return to checkout
          </Link>
          <Link
            href="/collections"
            className="inline-flex rounded-full border border-[#e8c8d6] bg-white px-6 py-2.5 text-[14px] font-semibold text-[#333] hover:bg-[#fdf0f5]"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </Shell>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <section className="rounded-2xl border border-[#f0d4e0] bg-white px-6 py-10 text-center">
            <div className="mx-auto size-12 animate-spin rounded-full border-4 border-[#f5d6e4] border-t-[#ea206d]" />
            <h1 className="mt-5 text-[26px] font-semibold text-[#1f1f1f]">
              Confirming your order
            </h1>
          </section>
        </Shell>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
