"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useRouter } from "next/navigation";
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
import {
  createAddress,
  formatAddressLines,
  getAddresses,
  type Address,
} from "../../lib/api/addresses";
import { addressToCheckout, checkoutToAddressInput } from "../../lib/addresses/mappers";
import { getApiErrorMessage, normalizeApiError } from "../../lib/api/errors";
import { formatCurrency } from "../../lib/storefront/commerce";
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

function isCheckoutAddressReady(address: CheckoutAddress) {
  const fullName = [address.firstName, address.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName.length >= 1 &&
    address.phone.trim().length >= 8 &&
    address.addressLine1.trim().length >= 1 &&
    address.city.trim().length >= 1 &&
    address.state.trim().length >= 1 &&
    address.postalCode.trim().length >= 3
  );
}

function CheckoutHeader() {
  const { itemCount, openCart } = useCartSidebar();

  return (
    <header className="border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[74px] sm:px-6">
        <Link
          href="/"
          className={`${dancingScript.className} min-w-0 truncate text-[20px] font-bold leading-none tracking-[0.01em] text-[#ea206d] sm:text-[28px] lg:text-[30px]`}
        >
          Katyayani Designer Hub
        </Link>
        <button
          type="button"
          onClick={openCart}
          aria-label={`Shopping cart, ${itemCount} items`}
          className="relative shrink-0 text-[#2f2f2f]"
        >
          <span className="text-[16px] sm:text-[22px]">Cart</span>
          <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-black px-1 text-center text-[10px] font-semibold text-white sm:-right-4">
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
  const router = useRouter();
  const {
    lines,
    invalidLines,
    itemCount,
    formattedSubtotal,
    isLoading: cartIsLoading,
    clearCart,
    refreshCart,
  } = useCartSidebar();
  const { isAuthenticated, status: authStatus, user } = useAuth();
  const { openLogin } = useLoginModal();
  const openCheckoutLogin = useCallback(() => {
    openLogin({
      reason: "checkout",
      onSuccess: () => {
        void runCheckoutRef.current();
      },
    });
  }, [openLogin]);
  const [address, setAddress] = useState<CheckoutAddress>(INITIAL_ADDRESS);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">("new");
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [quote, setQuote] = useState<QuoteViewModel | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [stage, setStage] = useState<CheckoutStage>("idle");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<OrderStatusViewModel | null>(null);
  const inFlightRef = useRef(false);
  const razorpayOpenRef = useRef(false);
  const paymentCallbackReceivedRef = useRef(false);
  const mountedRef = useRef(false);
  const pollingRunRef = useRef(0);
  const runCheckoutRef = useRef<(event?: FormEvent<HTMLFormElement>) => Promise<void>>(
    async () => {},
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      pollingRunRef.current += 1;
      razorpayOpenRef.current = false;
    };
  }, []);

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

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedAddresses([]);
      setSelectedAddressId("new");
      return;
    }

    let cancelled = false;
    setAddressesLoading(true);

    void getAddresses()
      .then((list) => {
        if (cancelled) return;
        setSavedAddresses(list);
        const defaultAddress = list.find((item) => item.isDefault) ?? list[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setAddress((prev) =>
            addressToCheckout(defaultAddress, prev.email || user?.email || ""),
          );
        } else {
          setSelectedAddressId("new");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedAddresses([]);
          setSelectedAddressId("new");
        }
      })
      .finally(() => {
        if (!cancelled) setAddressesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    if (
      !isAuthenticated ||
      lines.length === 0 ||
      invalidLines.length > 0 ||
      !isCheckoutAddressReady(address)
    ) {
      setQuote(null);
      return;
    }

    if (["quoting", "creating_order", "preparing_payment", "payment_open", "polling"].includes(stage)) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setQuoteLoading(true);
        try {
          const quoted = await quoteOrder({
            lines: cartLinesToCheckoutPayload(lines),
            address,
            cartLines: lines,
          });
          if (!cancelled) setQuote(quoted);
        } catch {
          if (!cancelled) setQuote(null);
        } finally {
          if (!cancelled) setQuoteLoading(false);
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address, invalidLines.length, isAuthenticated, lines, stage]);

  function selectSavedAddress(id: string) {
    const saved = savedAddresses.find((item) => item.id === id);
    if (!saved) return;
    setSelectedAddressId(id);
    setAddress((prev) => addressToCheckout(saved, prev.email || user?.email || ""));
  }

  function useNewAddress() {
    setSelectedAddressId("new");
    setAddress((prev) => ({
      ...INITIAL_ADDRESS,
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || "",
      firstName: prev.firstName || user?.firstName || user?.name.split(" ")[0] || "",
      lastName:
        prev.lastName ||
        user?.lastName ||
        user?.name.split(" ").slice(1).join(" ") ||
        "",
    }));
  }

  const pollOrderStatus = useCallback(async (id: string) => {
    const runId = pollingRunRef.current + 1;
    pollingRunRef.current = runId;
    const isActivePoll = () =>
      mountedRef.current && pollingRunRef.current === runId;

    if (isActivePoll()) setStage("polling");
    const startedAt = Date.now();
    const timeoutMs = 2 * 60 * 1000;
    let transientFailures = 0;

    while (isActivePoll() && Date.now() - startedAt < timeoutMs) {
      let nextStatus: OrderStatusViewModel;

      try {
        nextStatus = await getOrderStatus(id);
        transientFailures = 0;
      } catch (statusError) {
        if (!isActivePoll()) return null;

        const apiError = normalizeApiError(statusError);
        if (apiError.status === 401) {
          const failed: OrderStatusViewModel = {
            orderId: id,
            status: "FAILED",
            retryable: true,
            message: "Your session expired while confirming payment. Please sign in and check your order status.",
          };
          setStatusResult(failed);
          setStage("failed");
          return failed;
        }

        transientFailures += 1;
        if (transientFailures >= 5) {
          const failed: OrderStatusViewModel = {
            orderId: id,
            status: "FAILED",
            retryable: true,
            message:
              "We could not reach the payment status service. Please retry after checking your connection.",
          };
          setStatusResult(failed);
          setStage("failed");
          return failed;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 3000));
        continue;
      }

      if (!isActivePoll()) return null;

      setStatusResult(nextStatus);

      if (isTerminalStatus(nextStatus.status)) {
        if (nextStatus.status === "PAID") {
          await clearCart();
          if (!isActivePoll()) return nextStatus;
          router.replace(
            `/checkout/success?orderId=${encodeURIComponent(id)}`,
          );
          return nextStatus;
        }
        if (!isActivePoll()) return nextStatus;
        setStage(stageFromStatus(nextStatus.status));
        return nextStatus;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 2500));
    }

    if (!isActivePoll()) return null;

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
  }, [clearCart, router]);

  async function openRazorpay({
    preparedPayment,
    currentOrderId,
  }: {
    preparedPayment: RazorpayPrepareViewModel;
    currentOrderId: string;
  }) {
    if (razorpayOpenRef.current) return;
    razorpayOpenRef.current = true;
    paymentCallbackReceivedRef.current = false;

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
        paymentCallbackReceivedRef.current = true;
        razorpayOpenRef.current = false;
        void pollOrderStatus(currentOrderId);
      },
      modal: {
        ondismiss: () => {
          if (paymentCallbackReceivedRef.current) return;
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
      openCheckoutLogin();
      setError("Please sign in before checkout.");
      return;
    }

    if (invalidLines.length > 0) {
      setError("Remove unavailable cart items before checkout.");
      return;
    }

    if (lines.some((line) => !line.inStock || !line.available)) {
      setError("Some cart items are out of stock. Update your cart before checkout.");
      return;
    }

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    inFlightRef.current = true;

    try {
      setStage("quoting");
      const latestCart = await refreshCart();

      if (!latestCart) {
        setStage("idle");
        setError("We could not refresh your cart. Please sign in again and retry.");
        return;
      }

      if (latestCart.invalidLines.length > 0) {
        setStage("idle");
        setError("Remove unavailable cart items before checkout.");
        return;
      }

      if (latestCart.lines.some((line) => !line.inStock || !line.available)) {
        setStage("idle");
        setError("Some cart items are out of stock. Update your cart before checkout.");
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
        cartLines: latestCart.lines,
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

      if (selectedAddressId === "new" && saveNewAddress) {
        try {
          await createAddress(
            checkoutToAddressInput(address, {
              isDefault: savedAddresses.length === 0,
            }),
          );
        } catch {
          /* checkout should continue even if address save fails */
        }
      }

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

  runCheckoutRef.current = runCheckout;

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
  const hasUnavailableCartLines = lines.some(
    (line) => !line.inStock || !line.available,
  );
  const summarySubtotal = quote?.formattedSubtotal ?? formattedSubtotal;
  const summaryShipping = quote?.formattedShipping ?? "Free";
  const summaryTax = quote?.formattedTax ?? formatCurrency(0);
  const summaryTotal = quote?.formattedTotal ?? formattedSubtotal;

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <CheckoutHeader />

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-white px-4 py-7 sm:px-6 lg:pr-10">
          <h1 className="text-[26px] font-semibold text-[#1f1f1f] sm:text-[32px]">Checkout</h1>
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
            <div className="mt-6 rounded-xl border border-[#f0d4e0] bg-[#fefafc] px-4 py-4 text-[14px] text-[#555]">
              Checking your session...
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-6 rounded-xl border border-[#f0d4e0] bg-[#fefafc] px-4 py-4">
              <h2 className="text-[18px] font-semibold text-[#222]">
                Sign in required
              </h2>
              <p className="mt-2 text-[14px] text-[#666]">
                Checkout uses the authenticated cart and order reservation flow.
              </p>
              <button
                type="button"
                onClick={openCheckoutLogin}
                className="mt-4 rounded-full bg-[#ea206d] px-6 py-2.5 text-[14px] font-semibold text-white"
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
                    minLength={8}
                    maxLength={20}
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

                {addressesLoading ? (
                  <div className="mb-4 rounded-xl border border-[#f0d4e0] bg-[#fefafc] px-4 py-3 text-[14px] text-[#555]">
                    Loading saved addresses...
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="mb-4 space-y-2">
                    {savedAddresses.map((saved) => {
                      const selected = selectedAddressId === saved.id;
                      return (
                        <label
                          key={saved.id}
                          className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors ${
                            selected
                              ? "border-[#ea206d] bg-[#fdf0f5]"
                              : "border-[#dbdbdb] bg-white hover:border-[#c5c875]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="checkout-address"
                            checked={selected}
                            onChange={() => selectSavedAddress(saved.id)}
                            className="mt-1 size-4 shrink-0 accent-[#ea206d]"
                          />
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[14px] font-semibold text-[#222]">
                                {saved.label || saved.fullName}
                              </span>
                              {saved.isDefault ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                  Default
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-[13px] leading-relaxed text-[#666]">
                              {formatAddressLines(saved)}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                    <button
                      type="button"
                      onClick={useNewAddress}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition-colors ${
                        selectedAddressId === "new"
                          ? "border-[#ea206d] bg-[#fdf0f5] text-[#9a1548]"
                          : "border-[#dbdbdb] bg-white text-[#444] hover:border-[#c5c875]"
                      }`}
                    >
                      Use a different address
                    </button>
                  </div>
                ) : null}

                {selectedAddressId !== "new" && savedAddresses.length > 0 ? (
                  <div className="rounded-xl border border-[#eceee0] bg-[#fefafc] px-4 py-4">
                    <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-[#777]">
                      Delivering to
                    </p>
                    <p className="mt-2 text-[15px] font-medium text-[#222]">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-[#555]">
                      {[
                        address.addressLine1,
                        address.addressLine2,
                        [address.city, address.state].filter(Boolean).join(", "),
                        address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="mt-1 text-[14px] text-[#666]">{address.phone}</p>
                  </div>
                ) : (
                  <>
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
                      maxLength={200}
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
                      maxLength={200}
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
                        maxLength={80}
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
                        maxLength={80}
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
                        minLength={3}
                        maxLength={20}
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

                    <label className="mt-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(event) => setSaveNewAddress(event.target.checked)}
                        className="size-4 rounded border-[#dbdbdb] accent-[#ea206d]"
                      />
                      <span className="text-[14px] text-[#444]">
                        Save this address for future orders
                      </span>
                    </label>
                  </>
                )}
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
                    invalidLines.length > 0 ||
                    hasUnavailableCartLines
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
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{summarySubtotal}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Shipping</span>
                  <span>{summaryShipping}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Tax</span>
                  <span>{summaryTax}</span>
                </div>
                {quoteLoading && !quote ? (
                  <p className="text-[12px] text-[#888]">Updating totals...</p>
                ) : null}
                {!quote && !isCheckoutAddressReady(address) ? (
                  <p className="text-[12px] text-[#888]">
                    Enter your delivery address to confirm final totals.
                  </p>
                ) : null}
                <div className="flex items-center justify-between border-t border-[#dddddd] pt-3 text-[24px] font-semibold text-[#202020]">
                  <span>Total</span>
                  <span>{summaryTotal}</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
