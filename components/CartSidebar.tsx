"use client";

import Image from "next/image";
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

export type CartLine = {
  id: string;
  name: string;
  subtitle?: string;
  /** Price for one unit in INR */
  unitPrice: number;
  quantity: number;
  imageSrc: string;
};

type CartSidebarContextValue = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
};

const CartSidebarContext = createContext<CartSidebarContextValue | null>(null);
const CART_STORAGE_KEY = "katyayani_cart_lines_v1";

export function useCartSidebar() {
  const ctx = useContext(CartSidebarContext);
  if (!ctx) {
    throw new Error("useCartSidebar must be used within CartSidebarProvider");
  }
  return ctx;
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m22 4-10 10-4-4" />
    </svg>
  );
}

function AddedToBagToast({
  toast,
}: {
  toast: { id: number; name: string } | null;
}) {
  if (!toast) return null;

  const label =
    toast.name.length > 52 ? `${toast.name.slice(0, 51)}…` : toast.name;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[200] w-[min(calc(100%-1.5rem),28rem)] -translate-x-1/2"
    >
      <div
        key={toast.id}
        className="cart-toast-in flex items-start gap-3 rounded-2xl border border-[#e4e8cc] bg-white px-4 py-3.5 shadow-[0_12px_44px_rgba(0,0,0,0.14)]"
      >
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2f5e4] text-[#9ea600]">
          <CheckCircleIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9ea600]">
            Added to bag
          </p>
          <p
            className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-[#2f2f2f]"
            title={toast.name}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
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
      <path
        d="M52 56c0 8 4 14 8 14s8-6 8-14"
        className="text-[#9ea600]"
        strokeWidth="2"
      />
    </svg>
  );
}

export function CartSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartLine[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [addedToast, setAddedToast] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const toastIdRef = useRef(0);
  const toastHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const itemCount = useMemo(
    () => lines.reduce((n, line) => n + line.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );

  const addLine = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = line.quantity ?? 1;
      setLines((prev) => {
        const existing = prev.find((l) => l.id === line.id);
        if (existing) {
          return prev.map((l) =>
            l.id === line.id
              ? { ...l, quantity: l.quantity + qty }
              : l,
          );
        }
        return [...prev, { ...line, quantity: qty }];
      });

      if (toastHideRef.current) {
        clearTimeout(toastHideRef.current);
      }
      toastIdRef.current += 1;
      setAddedToast({ id: toastIdRef.current, name: line.name });
      toastHideRef.current = setTimeout(() => {
        setAddedToast(null);
        toastHideRef.current = null;
      }, 3200);
    },
    [],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.id !== id));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ignore write errors.
    }
  }, [lines]);

  useEffect(() => {
    return () => {
      if (toastHideRef.current) {
        clearTimeout(toastHideRef.current);
      }
    };
  }, []);

  const value: CartSidebarContextValue = {
    open,
    openCart,
    closeCart,
    lines,
    itemCount,
    subtotal,
    addLine,
    updateQuantity,
    removeLine,
    clearCart,
  };

  return (
    <CartSidebarContext.Provider value={value}>
      {children}
      <AddedToBagToast toast={addedToast} />
    </CartSidebarContext.Provider>
  );
}

export function CartSidebar() {
  const {
    open,
    closeCart,
    lines,
    itemCount,
    subtotal,
    updateQuantity,
    removeLine,
  } = useCartSidebar();
  const titleId = useId();
  const isEmpty = lines.length === 0;

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
        className={`fixed inset-0 z-[102] bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`fixed inset-y-0 right-0 z-[103] flex w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
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
              {isEmpty
                ? "Your cart"
                : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="-mr-1 -mt-1 cursor-pointer rounded-md p-2 text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5] hover:text-black"
            aria-label="Close cart"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 pb-12 text-center">
            <EmptyCartIllustration className="mb-8 h-28 w-28 text-[#9ea600]/35" />
            <h2 className="text-[20px] font-semibold text-[#2f2f2f]">
              Your cart is empty
            </h2>
            <p className="mt-3 max-w-[280px] text-[15px] leading-relaxed text-[#6a6a6a]">
              Discover new arrivals and timeless pieces — add something you love
              to get started.
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
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-4 border-b border-[#f5f5f5] pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="relative h-[110px] w-[78px] shrink-0 overflow-hidden rounded-lg bg-[#f7f7f5]">
                    <Image
                      src={line.imageSrc}
                      alt=""
                      fill
                      sizes="78px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[15px] font-semibold leading-snug text-[#2f2f2f]">
                      {line.name}
                    </p>
                    {line.subtitle ? (
                      <p className="mt-0.5 text-[13px] text-[#888]">
                        {line.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-2 text-[14px] font-medium text-[#2f2f2f]">
                      {formatInr(line.unitPrice)}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="inline-flex items-center rounded-md border border-[#e8e8e8]">
                        <button
                          type="button"
                          className="grid h-8 w-9 place-items-center text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5]"
                          aria-label={`Decrease quantity for ${line.name}`}
                          onClick={() =>
                            updateQuantity(line.id, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-[14px] font-medium tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="grid h-8 w-9 place-items-center text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5]"
                          aria-label={`Increase quantity for ${line.name}`}
                          onClick={() =>
                            updateQuantity(line.id, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-[13px] font-medium text-[#9a9a9a] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#b91c1c] hover:decoration-current"
                        onClick={() => removeLine(line.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 border-t border-[#f0f0f0] bg-[#fafaf8] px-6 py-5 lg:px-8">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] text-[#555]">Subtotal</span>
                <span className="text-[18px] font-semibold text-[#2f2f2f]">
                  {formatInr(subtotal)}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-[#888]">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center border border-[#2f2f2f] bg-white text-[15px] font-semibold text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5]"
                >
                  Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-12 items-center justify-center bg-[#2f2f2f] text-[15px] font-semibold text-white transition-colors hover:bg-black"
                >
                  Checkout
                </Link>
              </div>
              <Link
                href="/collections"
                onClick={closeCart}
                className="mt-3 block text-center text-[14px] font-medium text-[#9ea600] underline-offset-2 hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
