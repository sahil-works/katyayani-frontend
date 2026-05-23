"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useCartSidebar } from "../../components/CartSidebar";
import { useLoginModal } from "../../components/LoginModal";
import { StorefrontImage } from "../../components/storefront/StorefrontImage";
import {
  cartLinesToCheckoutPayload,
  createOrder,
  getOrderStatus,
  prepareRazorpayPayment,
  quoteOrder,
  type CheckoutAddress,
  type OrderStatusViewModel,
  type QuoteViewModel,
  type RazorpayPrepareViewModel,
} from "../../lib/api/checkout";
import { getMyCart } from "../../lib/api/cart";
import { getApiErrorMessage } from "../../lib/api/errors";
import { useAuth } from "../../providers/AuthProvider";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type CheckoutStage =
  | "idle"
  | "quoting"
  | "creating_order"
  | "preparing_payment"
  | "payment_open"
  | "polling"
  | "success"
  | "failed"
  | "cancelled"
  | "expired";

type RazorpaySuccessResponse = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: RazorpayPrepareViewModel["prefill"];
  notes?: RazorpayPrepareViewModel["notes"];
  timeout?: number;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const INITIAL_ADDRESS: CheckoutAddress = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

let razorpayScriptPromise: Promise<void> | null = null;

function generateIdempotencyKey() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser."));
  }

  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

function isTerminalStatus(status: OrderStatusViewModel["status"]) {
  return (
    status === "PAID" ||
    status === "FAILED" ||
    status === "CANCELLED" ||
    status === "EXPIRED"
  );
}

function stageFromStatus(status: OrderStatusViewModel["status"]): CheckoutStage {
  if (status === "PAID") return "success";
  if (status === "CANCELLED") return "cancelled";
  if (status === "EXPIRED") return "expired";
  return "failed";
}

function CheckoutHeader() {
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

function CheckoutResult({
  stage,
  status,
  onRetry,
}: {
  stage: CheckoutStage;
  status: OrderStatusViewModel | null;
  onRetry: () => void;
}) {
  if (!["success", "failed", "cancelled", "expired"].includes(stage)) {
    return null;
  }

  const isSuccess = stage === "success";
  const title =
    stage === "success"
      ? "Payment successful"
      : stage === "expired"
        ? "Checkout expired"
        : stage === "cancelled"
          ? "Payment cancelled"
          : "Payment failed";

  return (
    <section
      className={`mb-6 rounded-2xl border px-5 py-5 ${
        isSuccess
          ? "border-[#cce8ce] bg-[#f3fbf3] text-[#245d2b]"
          : "border-[#f0d4d4] bg-[#fff7f7] text-[#704040]"
      }`}
    >
      <h2 className="text-[22px] font-semibold">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed">
        {status?.message ??
          (isSuccess
            ? "Your order is confirmed."
            : "We could not confirm this payment.")}
      </p>
      {status?.orderId ? (
        <p className="mt-2 text-[13px]">Order ID: {status.orderId}</p>
      ) : null}
      {!isSuccess && status?.retryable ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-[#2f2f2f] px-5 py-2 text-[14px] font-semibold text-white"
        >
          Try payment again
        </button>
      ) : null}
      {isSuccess ? (
        <Link
          href="/"
          className="mt-4 inline-flex rounded-full bg-[#2f2f2f] px-5 py-2 text-[14px] font-semibold text-white"
        >
          Continue shopping
        </Link>
      ) : null}
    </section>
  );
}

export default function CheckoutPage() {
  const {
    lines,
    invalidLines,
    itemCount,
    isLoading: cartIsLoading,
    refreshCart,
  } = useCartSidebar();
  const { isAuthenticated, status: authStatus, user } = useAuth();
  const { openLogin } = useLoginModal();
  const [address, setAddress] = useState<CheckoutAddress>(INITIAL_ADDRESS);
  const [quote, setQuote] = useState<QuoteViewModel | null>(null);
  const [stage, setStage] = useState<CheckoutStage>("idle");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<OrderStatusViewModel | null>(null);
  const inFlightRef = useRef(false);
  const razorpayOpenRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({
      ...prev,
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      firstName: prev.firstName || user.firstName || user.name.split(" ")[0] || "",
      lastName:
        prev.lastName ||
        user.lastName ||
        user.name.split(" ").slice(1).join(" "),
    }));
  }, [user]);

  const pollOrderStatus = useCallback(async (id: string) => {
    setStage("polling");
    const startedAt = Date.now();
    const timeoutMs = 2 * 60 * 1000;

    while (Date.now() - startedAt < timeoutMs) {
      const nextStatus = await getOrderStatus(id);
      setStatusResult(nextStatus);

      if (isTerminalStatus(nextStatus.status)) {
        setStage(stageFromStatus(nextStatus.status));
        return nextStatus;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 2500));
    }

    const expired: OrderStatusViewModel = {
      orderId: id,
      status: "EXPIRED",
      retryable: true,
      message:
        "Payment confirmation is taking too long. You can retry or check your order status later.",
    };
    setStatusResult(expired);
    setStage("expired");
    return expired;
  }, []);

  async function openRazorpay({
    preparedPayment,
    currentOrderId,
  }: {
    preparedPayment: RazorpayPrepareViewModel;
    currentOrderId: string;
  }) {
    if (razorpayOpenRef.current) return;
    razorpayOpenRef.current = true;

    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error("Razorpay Checkout is unavailable.");
    }

    setStage("payment_open");

    const checkout = new window.Razorpay({
      key: preparedPayment.key,
      amount: preparedPayment.amount,
      currency: preparedPayment.currency,
      name: preparedPayment.name,
      description: preparedPayment.description,
      image: preparedPayment.image,
      order_id: preparedPayment.razorpayOrderId,
      prefill: preparedPayment.prefill,
      notes: preparedPayment.notes,
      timeout: preparedPayment.timeout,
      handler: () => {
        // The frontend callback is only a signal to start backend verification.
        razorpayOpenRef.current = false;
        void pollOrderStatus(currentOrderId);
      },
      modal: {
        ondismiss: () => {
          razorpayOpenRef.current = false;
          setStatusResult({
            orderId: currentOrderId,
            status: "CANCELLED",
            retryable: true,
            message:
              "The payment popup was closed before confirmation. You can retry payment.",
          });
          setStage("cancelled");
        },
      },
    });

    checkout.open();
  }

  async function runCheckout(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (inFlightRef.current || razorpayOpenRef.current) return;
    setError("");
    setStatusResult(null);

    if (!isAuthenticated) {
      openLogin();
      setError("Please sign in before checkout.");
      return;
    }

    if (invalidLines.length > 0) {
      setError("Remove unavailable cart items before checkout.");
      return;
    }

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    inFlightRef.current = true;

    try {
      setStage("quoting");
      await refreshCart();
      const latestCart = await getMyCart();

      if (latestCart.invalidLines.length > 0) {
        setStage("idle");
        setError("Remove unavailable cart items before checkout.");
        return;
      }

      if (latestCart.lines.length === 0) {
        setStage("idle");
        setError("Your cart is empty.");
        return;
      }

      const quoted = await quoteOrder({
        lines: cartLinesToCheckoutPayload(latestCart.lines),
        address,
      });
      setQuote(quoted);

      if (!quoted.valid) {
        setStage("idle");
        setError(quoted.message || "Some cart items are unavailable.");
        return;
      }

      setStage("creating_order");
      const order = await createOrder({ quote: quoted, address });
      setOrderId(order.id);

      setStage("preparing_payment");
      const idempotencyKey = generateIdempotencyKey();
      const preparedPayment = await prepareRazorpayPayment({
        orderId: order.id,
        idempotencyKey,
      });

      await openRazorpay({
        preparedPayment,
        currentOrderId: order.id,
      });
    } catch (checkoutError) {
      setError(getApiErrorMessage(checkoutError));
      setStage("failed");
    } finally {
      inFlightRef.current = false;
    }
  }

  async function retryPayment() {
    if (!orderId || inFlightRef.current || razorpayOpenRef.current) return;
    setError("");
    inFlightRef.current = true;

    try {
      setStage("preparing_payment");
      const preparedPayment = await prepareRazorpayPayment({
        orderId,
        idempotencyKey: generateIdempotencyKey(),
      });
      await openRazorpay({ preparedPayment, currentOrderId: orderId });
    } catch (retryError) {
      setError(getApiErrorMessage(retryError));
      setStage("failed");
    } finally {
      inFlightRef.current = false;
    }
  }

  const buttonLabel =
    stage === "quoting"
      ? "Validating cart..."
      : stage === "creating_order"
        ? "Creating order..."
        : stage === "preparing_payment"
          ? "Preparing payment..."
          : stage === "payment_open" || stage === "polling"
            ? "Waiting for payment..."
            : "Pay securely with Razorpay";
  const isBusy = [
    "quoting",
    "creating_order",
    "preparing_payment",
    "payment_open",
    "polling",
  ].includes(stage);

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <CheckoutHeader />

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-white px-4 py-7 sm:px-6 lg:pr-10">
          <h1 className="text-[32px] font-semibold text-[#1f1f1f]">Checkout</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#666]">
            Cart totals are revalidated with the backend before order creation.
          </p>

          <CheckoutResult
            stage={stage}
            status={statusResult}
            onRetry={() => void retryPayment()}
          />

          {error ? (
            <div className="mt-5 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] px-4 py-3 text-[14px] text-[#704040]">
              {error}
            </div>
          ) : null}

          {authStatus === "initializing" ? (
            <div className="mt-6 rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-4 text-[14px] text-[#555]">
              Checking your session...
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-6 rounded-xl border border-[#e3e5d8] bg-[#fafbf7] px-4 py-4">
              <h2 className="text-[18px] font-semibold text-[#222]">
                Sign in required
              </h2>
              <p className="mt-2 text-[14px] text-[#666]">
                Checkout uses the authenticated cart and order reservation flow.
              </p>
              <button
                type="button"
                onClick={openLogin}
                className="mt-4 rounded-full bg-[#9ea600] px-6 py-2.5 text-[14px] font-semibold text-white"
              >
                Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void runCheckout(event)} className="mt-7">
              <section>
                <h2 className="mb-3 text-[25px] font-semibold text-[#1f1f1f]">
                  Contact
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={address.email}
                    onChange={(event) =>
                      setAddress((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone"
                    value={address.phone}
                    onChange={(event) =>
                      setAddress((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                </div>
              </section>

              <section className="mt-7">
                <h2 className="mb-3 text-[25px] font-semibold text-[#1f1f1f]">
                  Delivery
                </h2>
                <select
                  value={address.country}
                  onChange={() => undefined}
                  className="h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                >
                  <option>India</option>
                </select>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={address.firstName}
                    onChange={(event) =>
                      setAddress((prev) => ({
                        ...prev,
                        firstName: event.target.value,
                      }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={address.lastName}
                    onChange={(event) =>
                      setAddress((prev) => ({
                        ...prev,
                        lastName: event.target.value,
                      }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Address"
                  value={address.addressLine1}
                  onChange={(event) =>
                    setAddress((prev) => ({
                      ...prev,
                      addressLine1: event.target.value,
                    }))
                  }
                  className="mt-3 h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                />
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={address.addressLine2}
                  onChange={(event) =>
                    setAddress((prev) => ({
                      ...prev,
                      addressLine2: event.target.value,
                    }))
                  }
                  className="mt-3 h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                />

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_1fr]">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={address.city}
                    onChange={(event) =>
                      setAddress((prev) => ({ ...prev, city: event.target.value }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={address.state}
                    onChange={(event) =>
                      setAddress((prev) => ({ ...prev, state: event.target.value }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN code"
                    value={address.postalCode}
                    onChange={(event) =>
                      setAddress((prev) => ({
                        ...prev,
                        postalCode: event.target.value,
                      }))
                    }
                    className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                </div>
              </section>

              {quote && !quote.valid ? (
                <section className="mt-7 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] px-4 py-4">
                  <h3 className="text-[18px] font-semibold text-[#704040]">
                    Cart needs attention
                  </h3>
                  <ul className="mt-3 space-y-2 text-[14px] text-[#704040]">
                    {quote.unavailableItems.map((item, index) => (
                      <li key={`${item.productId ?? "item"}-${index}`}>
                        {item.title}: {item.reason}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="mt-7">
                <h3 className="text-[23px] font-semibold text-[#1f1f1f]">
                  Payment
                </h3>
                <p className="mt-1 text-[14px] text-[#666]">
                  Razorpay will open in a secure popup. Final confirmation comes
                  from backend payment status polling.
                </p>
                <button
                  type="submit"
                  disabled={
                    isBusy ||
                    cartIsLoading ||
                    lines.length === 0 ||
                    invalidLines.length > 0
                  }
                  className="mt-4 h-12 w-full rounded-md bg-[#0070f3] text-[16px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {buttonLabel}
                </button>
              </section>
            </form>
          )}
        </section>

        <aside className="border-t border-[#e8e8e8] bg-[#f5f5f5] px-4 py-7 sm:px-6 lg:border-l lg:border-t-0">
          {lines.length === 0 && invalidLines.length === 0 ? (
            <div className="rounded-md border border-[#dddddd] bg-white p-5">
              <p className="text-[15px] text-[#333]">Your cart is empty.</p>
              <Link
                href="/collections"
                className="mt-3 inline-block text-[14px] font-medium text-[#1f5f9e] hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {[...invalidLines, ...lines].map((line) => (
                  <li key={line.id} className="flex items-center gap-3">
                    <div className="relative h-[64px] w-[64px] overflow-hidden rounded-md border border-[#ddd] bg-white">
                      <StorefrontImage
                        image={line.image}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#5f5f5f] px-1 text-[11px] font-semibold text-white">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#232323]">
                        {line.productTitle}
                      </p>
                      {line.variantTitle ? (
                        <p className="truncate text-[13px] text-[#707070]">
                          {line.variantTitle}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-[14px] font-medium text-[#222]">
                      {line.formattedLineSubtotal}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-2 border-t border-[#dddddd] pt-4">
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Cart subtotal ({itemCount} items)</span>
                  <span>Not final</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Quote subtotal</span>
                  <span>{quote?.formattedSubtotal ?? "Pending"}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Shipping</span>
                  <span>{quote?.formattedShipping ?? "Pending"}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Tax</span>
                  <span>{quote?.formattedTax ?? "Pending"}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#dddddd] pt-3 text-[24px] font-semibold text-[#202020]">
                  <span>Total</span>
                  <span>{quote?.formattedTotal ?? "Quote required"}</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
