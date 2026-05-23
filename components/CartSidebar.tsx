"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addCartItem,
  clearMyCart,
  getMyCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../lib/api/cart";
import { getApiErrorMessage, normalizeApiError } from "../lib/api/errors";
import type {
  AddCartLineInput,
  CartLineIdentity,
  CartLineViewModel,
  CartViewModel,
} from "../lib/cart/types";
import { formatCurrency } from "../lib/storefront/commerce";
import { useAuth } from "../providers/AuthProvider";
import { StorefrontImage } from "./storefront/StorefrontImage";

type CartMode = "guest" | "authenticated";

type CartSidebarContextValue = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  mode: CartMode;
  lines: CartLineViewModel[];
  invalidLines: CartLineViewModel[];
  itemCount: number;
  subtotal: number;
  formattedSubtotal: string;
  hasInvalidItems: boolean;
  isLoading: boolean;
  error: string;
  replayMessage: string;
  addLine: (line: AddCartLineInput) => Promise<void>;
  updateQuantity: (line: CartLineIdentity, quantity: number) => Promise<void>;
  removeLine: (line: CartLineIdentity) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<CartViewModel | null>;
};

const CartSidebarContext = createContext<CartSidebarContextValue | null>(null);
const GUEST_CART_STORAGE_KEY = "katyayani_guest_cart_lines_v2";

const EMPTY_CART: CartViewModel = {
  lines: [],
  invalidLines: [],
  itemCount: 0,
  subtotal: 0,
  formattedSubtotal: formatCurrency(0),
  hasInvalidItems: false,
};

export function useCartSidebar() {
  const ctx = useContext(CartSidebarContext);
  if (!ctx) {
    throw new Error("useCartSidebar must be used within CartSidebarProvider");
  }
  return ctx;
}

function toLineId(line: CartLineIdentity) {
  return `${line.productId}:${line.variantId}`;
}

function normalizeGuestCart(lines: CartLineViewModel[]): CartViewModel {
  const subtotal = lines.reduce((sum, line) => sum + line.lineSubtotal, 0);

  return {
    lines,
    invalidLines: [],
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    formattedSubtotal: formatCurrency(subtotal),
    hasInvalidItems: false,
  };
}

function normalizeQuantity(quantity: number, maxQuantity?: number) {
  const normalized = Math.max(0, Math.floor(quantity));
  return typeof maxQuantity === "number"
    ? Math.min(normalized, Math.max(0, maxQuantity))
    : normalized;
}

function createGuestLine(input: AddCartLineInput): CartLineViewModel {
  const quantity = Math.max(1, Math.floor(input.quantity));
  const lineSubtotal = input.effectivePrice * quantity;

  return {
    id: toLineId(input),
    productId: input.productId,
    variantId: input.variantId,
    productTitle: input.productTitle,
    slug: input.slug,
    category: input.category,
    variantTitle: input.variantTitle,
    image: input.image,
    quantity,
    availableQuantity: input.availableQuantity,
    effectivePrice: input.effectivePrice,
    formattedEffectivePrice: formatCurrency(input.effectivePrice),
    lineSubtotal,
    formattedLineSubtotal: formatCurrency(lineSubtotal),
    inStock: input.inStock,
    available: input.available,
    stockLabel: input.stockLabel,
  };
}

function readGuestCartFromStorage() {
  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLineViewModel[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCartToStorage(lines: CartLineViewModel[]) {
  try {
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage can fail in private windows; the in-memory cart still works.
  }
}

function EmptyCartIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M28 88V42h8l10-18h28l10 18h12v46H28z" className="text-[#d8dcc4]" />
      <path d="M28 42h64M38 24h36" className="text-[#c5c9b0]" />
      <circle cx="44" cy="96" r="3" className="text-[#9ea600]" fill="currentColor" stroke="none" />
      <circle cx="76" cy="96" r="3" className="text-[#9ea600]" fill="currentColor" stroke="none" />
      <path d="M52 56c0 8 4 14 8 14s8-6 8-14" className="text-[#9ea600]" strokeWidth="2" />
    </svg>
  );
}

export function CartSidebarProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, status, refresh, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [guestLines, setGuestLines] = useState<CartLineViewModel[]>([]);
  const [backendCart, setBackendCart] = useState<CartViewModel>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [replayMessage, setReplayMessage] = useState("");
  const [hasHydratedGuestCart, setHasHydratedGuestCart] = useState(false);
  const hasReplayedRef = useRef(false);
  const mutationInFlightRef = useRef(false);

  const mode: CartMode = isAuthenticated ? "authenticated" : "guest";
  const guestCart = useMemo(() => normalizeGuestCart(guestLines), [guestLines]);
  const activeCart = mode === "authenticated" ? backendCart : guestCart;

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (hasHydratedGuestCart) return;
    setGuestLines(readGuestCartFromStorage());
    setHasHydratedGuestCart(true);
  }, [hasHydratedGuestCart]);

  useEffect(() => {
    if (!hasHydratedGuestCart || mode !== "guest") return;
    writeGuestCartToStorage(guestLines);
  }, [guestLines, hasHydratedGuestCart, mode]);

  useEffect(() => {
    if (!hasHydratedGuestCart || mode !== "guest") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== GUEST_CART_STORAGE_KEY) return;
      setGuestLines(readGuestCartFromStorage());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hasHydratedGuestCart, mode]);

  const withAuthRetry = useCallback(
    async <T,>(operation: () => Promise<T>) => {
      try {
        return await operation();
      } catch (error) {
        const apiError = normalizeApiError(error);
        if (apiError.status !== 401) throw apiError;

        await refresh();

        try {
          return await operation();
        } catch (retryError) {
          const retryApiError = normalizeApiError(retryError);
          if (retryApiError.status === 401) {
            await logout();
          }
          throw retryApiError;
        }
      }
    },
    [logout, refresh],
  );

  const runCartMutation = useCallback(
    async (operation: () => Promise<CartViewModel>) => {
      if (mutationInFlightRef.current) return null;

      mutationInFlightRef.current = true;
      setIsLoading(true);
      setError("");

      try {
        const cart = await withAuthRetry(operation);
        setBackendCart(cart);
        return cart;
      } catch (cartError) {
        setError(getApiErrorMessage(cartError));
        return null;
      } finally {
        mutationInFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [withAuthRetry],
  );

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return null;

    setError("");
    try {
      const cart = await withAuthRetry(getMyCart);
      setBackendCart(cart);
      return cart;
    } catch (cartError) {
      setError(getApiErrorMessage(cartError));
      return null;
    }
  }, [isAuthenticated, withAuthRetry]);

  useEffect(() => {
    if (status !== "authenticated" || !hasHydratedGuestCart) return;
    if (hasReplayedRef.current) {
      void refreshCart();
      return;
    }

    hasReplayedRef.current = true;
    let cancelled = false;

    async function replayGuestCart() {
      setIsLoading(true);
      setReplayMessage("");
      setError("");
      const failedLines: CartLineViewModel[] = [];

      try {
        let currentCart = await withAuthRetry(getMyCart);

        for (const line of guestLines) {
          try {
            const existing = currentCart.lines.find(
              (item) =>
                item.productId === line.productId &&
                item.variantId === line.variantId,
            );
            const quantity = normalizeQuantity(
              (existing?.quantity ?? 0) + line.quantity,
              existing?.availableQuantity ?? line.availableQuantity,
            );
            if (quantity < 1) throw new Error("This item is unavailable.");

            currentCart = await withAuthRetry(() =>
              addCartItem({
                productId: line.productId,
                variantId: line.variantId,
                quantity,
                productTitle: line.productTitle,
                slug: line.slug,
                category: line.category,
                variantTitle: line.variantTitle,
                image: line.image,
                effectivePrice: line.effectivePrice,
                availableQuantity: line.availableQuantity,
                inStock: line.inStock,
                available: line.available,
                stockLabel: line.stockLabel,
              }),
            );
          } catch {
            failedLines.push(line);
          }
        }

        if (cancelled) return;

        setBackendCart(currentCart);
        setGuestLines(failedLines);
        writeGuestCartToStorage(failedLines);
        setReplayMessage(
          failedLines.length > 0
            ? "Some guest cart items could not be synced. They remain in your guest cart."
            : "",
        );
      } catch (cartError) {
        if (!cancelled) setError(getApiErrorMessage(cartError));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void replayGuestCart();

    return () => {
      cancelled = true;
    };
  }, [guestLines, hasHydratedGuestCart, refreshCart, status, withAuthRetry]);

  useEffect(() => {
    if (status === "guest") {
      hasReplayedRef.current = false;
      setBackendCart(EMPTY_CART);
    }
  }, [status]);

  const addLine = useCallback(
    async (input: AddCartLineInput) => {
      setError("");

      if (!isAuthenticated) {
        setGuestLines((prev) => {
          const id = toLineId(input);
          const existing = prev.find((line) => line.id === id);
          if (!existing) return [...prev, createGuestLine(input)];

          return prev.map((line) => {
            if (line.id !== id) return line;
            const quantity = normalizeQuantity(
              line.quantity + Math.max(1, input.quantity),
              line.availableQuantity ?? input.availableQuantity,
            );
            const lineSubtotal = line.effectivePrice * quantity;
            return {
              ...line,
              quantity,
              lineSubtotal,
              formattedLineSubtotal: formatCurrency(lineSubtotal),
            };
          });
        });
        return;
      }

      await runCartMutation(async () => {
        const latestCart = await withAuthRetry(getMyCart);
        const existing = latestCart.lines.find(
          (line) =>
            line.productId === input.productId &&
            line.variantId === input.variantId,
        );
        const quantity = normalizeQuantity(
          (existing?.quantity ?? 0) + Math.max(1, input.quantity),
          existing?.availableQuantity ?? input.availableQuantity,
        );

        if (quantity < 1) {
          throw new Error("This item is unavailable.");
        }

        return withAuthRetry(() => addCartItem({ ...input, quantity }));
      });
    },
    [isAuthenticated, runCartMutation, withAuthRetry],
  );

  const updateQuantity = useCallback(
    async (line: CartLineIdentity, quantity: number) => {
      const activeLine =
        activeCart.lines.find((item) => item.id === toLineId(line)) ??
        activeCart.invalidLines.find((item) => item.id === toLineId(line));
      const normalizedQuantity = normalizeQuantity(
        quantity,
        activeLine?.availableQuantity,
      );
      setError("");

      if (!isAuthenticated) {
        setGuestLines((prev) =>
          normalizedQuantity < 1
            ? prev.filter((item) => item.id !== toLineId(line))
            : prev.map((item) => {
                if (item.id !== toLineId(line)) return item;
                const lineSubtotal = item.effectivePrice * normalizedQuantity;
                return {
                  ...item,
                  quantity: normalizedQuantity,
                  lineSubtotal,
                  formattedLineSubtotal: formatCurrency(lineSubtotal),
                };
              }),
        );
        return;
      }

      await runCartMutation(async () =>
        normalizedQuantity < 1
          ? await removeCartItem(line)
          : await updateCartItemQuantity({ ...line, quantity: normalizedQuantity }),
      );
    },
    [activeCart.invalidLines, activeCart.lines, isAuthenticated, runCartMutation],
  );

  const removeLine = useCallback(
    async (line: CartLineIdentity) => {
      await updateQuantity(line, 0);
    },
    [updateQuantity],
  );

  const clearCart = useCallback(async () => {
    setError("");
    if (!isAuthenticated) {
      setGuestLines([]);
      writeGuestCartToStorage([]);
      return;
    }

    await runCartMutation(clearMyCart);
  }, [isAuthenticated, runCartMutation]);

  const value: CartSidebarContextValue = {
    open,
    openCart,
    closeCart,
    mode,
    lines: activeCart.lines,
    invalidLines: activeCart.invalidLines,
    itemCount: activeCart.itemCount,
    subtotal: activeCart.subtotal,
    formattedSubtotal: activeCart.formattedSubtotal,
    hasInvalidItems: activeCart.hasInvalidItems,
    isLoading,
    error,
    replayMessage,
    addLine,
    updateQuantity,
    removeLine,
    clearCart,
    refreshCart,
  };

  return (
    <CartSidebarContext.Provider value={value}>
      {children}
    </CartSidebarContext.Provider>
  );
}

function CartLineRow({
  line,
  invalid,
}: {
  line: CartLineViewModel;
  invalid?: boolean;
}) {
  const { updateQuantity, removeLine, isLoading } = useCartSidebar();
  const href = line.slug ? `/products/${line.slug}` : "/collections";
  const reachedAvailableLimit =
    typeof line.availableQuantity === "number" &&
    line.quantity >= line.availableQuantity;

  return (
    <li className="flex gap-4 border-b border-[#f5f5f5] pb-4 last:border-b-0 last:pb-0">
      <Link
        href={href}
        className="relative h-[110px] w-[78px] shrink-0 overflow-hidden rounded-lg bg-[#f7f7f5]"
      >
        <StorefrontImage
          image={line.image}
          fill
          sizes="78px"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={href} className="text-[15px] font-semibold leading-snug text-[#2f2f2f] hover:underline">
          {line.productTitle}
        </Link>
        {line.category ? (
          <p className="mt-0.5 text-[13px] text-[#888]">{line.category}</p>
        ) : null}
        {line.variantTitle ? (
          <p className="mt-0.5 text-[13px] text-[#888]">{line.variantTitle}</p>
        ) : null}
        <p className="mt-2 text-[14px] font-medium text-[#2f2f2f]">
          {line.formattedEffectivePrice}
        </p>
        <p
          className={`mt-1 text-[12px] font-medium ${
            line.inStock && line.available ? "text-[#5f6a00]" : "text-[#9a3f3f]"
          }`}
        >
          {invalid ? line.invalidReason : line.stockLabel}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex items-center rounded-md border border-[#e8e8e8]">
            <button
              type="button"
              disabled={isLoading || invalid}
              className="grid h-8 w-9 place-items-center text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5] disabled:opacity-40"
              aria-label={`Decrease quantity for ${line.productTitle}`}
              onClick={() => updateQuantity(line, line.quantity - 1)}
            >
              −
            </button>
            <span className="min-w-8 text-center text-[14px] font-medium tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              disabled={isLoading || invalid || reachedAvailableLimit}
              className="grid h-8 w-9 place-items-center text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5] disabled:opacity-40"
              aria-label={`Increase quantity for ${line.productTitle}`}
              onClick={() => updateQuantity(line, line.quantity + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={isLoading}
            className="text-[13px] font-medium text-[#9a9a9a] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#b91c1c] hover:decoration-current disabled:opacity-40"
            onClick={() => removeLine(line)}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartSidebar() {
  const {
    open,
    closeCart,
    lines,
    invalidLines,
    itemCount,
    formattedSubtotal,
    hasInvalidItems,
    mode,
    error,
    replayMessage,
    isLoading,
    clearCart,
  } = useCartSidebar();
  const titleId = useId();
  const isEmpty = lines.length === 0 && invalidLines.length === 0;

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeCart]);

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-102 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`fixed inset-y-0 right-0 z-103 flex w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#f0f0f0] px-6 py-6 lg:px-8">
          <div>
            <p
              id={titleId}
              className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9a9a9a]"
            >
              Shopping bag
            </p>
            <p className="mt-1 text-[18px] font-semibold text-[#2f2f2f]">
              {isEmpty ? "Your cart" : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </p>
            <p className="mt-1 text-[12px] text-[#888]">
              {mode === "guest" ? "Guest cart" : "Account cart"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="-mr-1 -mt-1 cursor-pointer rounded-md p-2 text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5] hover:text-black"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {error || replayMessage ? (
          <div className="mx-6 mt-4 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] px-4 py-3 text-[13px] leading-relaxed text-[#704040] lg:mx-8">
            {error || replayMessage}
          </div>
        ) : null}

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 pb-12 text-center">
            <EmptyCartIllustration className="mb-8 h-28 w-28 text-[#9ea600]/35" />
            <h2 className="text-[20px] font-semibold text-[#2f2f2f]">
              Your cart is empty
            </h2>
            <p className="mt-3 max-w-[280px] text-[15px] leading-relaxed text-[#6a6a6a]">
              Discover new arrivals and timeless pieces to get started.
            </p>
            <Link
              href="/collections"
              onClick={closeCart}
              className="mt-8 inline-flex h-12 items-center justify-center bg-[#9ea600] px-10 text-[15px] font-semibold text-white transition-colors hover:bg-[#8b9200]"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6 lg:px-8">
              {invalidLines.map((line) => (
                <CartLineRow key={`invalid-${line.id}`} line={line} invalid />
              ))}
              {lines.map((line) => (
                <CartLineRow key={line.id} line={line} />
              ))}
            </ul>

            <div className="shrink-0 border-t border-[#f0f0f0] bg-[#fafaf8] px-6 py-5 lg:px-8">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] text-[#555]">Live subtotal</span>
                <span className="text-[18px] font-semibold text-[#2f2f2f]">
                  {formattedSubtotal}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#888]">
                Prices and stock are revalidated before checkout.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center border border-[#2f2f2f] bg-white text-[15px] font-semibold text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5]"
                >
                  Cart
                </Link>
                {hasInvalidItems ? (
                  <button
                    type="button"
                    disabled
                    className="flex h-12 items-center justify-center bg-[#2f2f2f] text-[15px] font-semibold text-white opacity-45"
                  >
                    Fix items
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex h-12 items-center justify-center bg-[#2f2f2f] text-[15px] font-semibold text-white transition-colors hover:bg-black"
                  >
                    Checkout
                  </Link>
                )}
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void clearCart()}
                className="mt-3 block w-full text-center text-[14px] font-medium text-[#9a3f3f] underline-offset-2 hover:underline disabled:opacity-40"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
