"use client";

import Link from "next/link";
import { useCartSidebar } from "../../components/CartSidebar";
import Footer from "../../components/Footer";
import { StorefrontImage } from "../../components/storefront/StorefrontImage";
import type { CartLineViewModel } from "../../lib/cart/types";

function CartLineRow({
  line,
  invalid,
}: {
  line: CartLineViewModel;
  invalid?: boolean;
}) {
  const { updateQuantity, removeLine, isLoading } = useCartSidebar();
  const href = line.slug ? `/products/${line.slug}` : "/collections";

  return (
    <li className="grid grid-cols-1 gap-4 border-b border-[#ececec] px-4 py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_180px_180px] md:items-center md:px-6">
      <div className="flex items-start gap-4">
        <Link
          href={href}
          className="relative h-[94px] w-[72px] shrink-0 overflow-hidden rounded-sm border border-[#e4e4e4] bg-[#f9f9f9]"
        >
          <StorefrontImage
            image={line.image}
            fill
            sizes="72px"
            className="object-cover"
          />
        </Link>
        <div>
          <Link
            href={href}
            className="text-[22px] leading-tight font-medium text-[#1f1f1f] hover:underline"
          >
            {line.productTitle}
          </Link>
          {line.category ? (
            <p className="mt-1 text-[14px] text-[#777]">{line.category}</p>
          ) : null}
          {line.variantTitle ? (
            <p className="mt-1 text-[14px] text-[#777]">{line.variantTitle}</p>
          ) : null}
          <p
            className={`mt-2 text-[13px] font-medium ${
              invalid || !line.inStock || !line.available
                ? "text-[#9a3f3f]"
                : "text-[#5f6a00]"
            }`}
          >
            {invalid ? line.invalidReason : line.stockLabel}
          </p>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void removeLine(line)}
            className="mt-2 text-[14px] text-[#6a6a6a] hover:underline disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="md:justify-self-center">
        <div className="inline-flex h-11 items-center rounded-sm border border-[#dedede]">
          <button
            type="button"
            disabled={isLoading || invalid}
            onClick={() => void updateQuantity(line, line.quantity - 1)}
            className="grid h-full w-11 place-items-center text-[18px] text-[#444] hover:bg-[#f4f4f4] disabled:opacity-40"
            aria-label={`Decrease quantity for ${line.productTitle}`}
          >
            −
          </button>
          <span className="grid h-full min-w-[42px] place-items-center border-x border-[#dedede] text-[14px]">
            {line.quantity}
          </span>
          <button
            type="button"
            disabled={isLoading || invalid}
            onClick={() => void updateQuantity(line, line.quantity + 1)}
            className="grid h-full w-11 place-items-center text-[18px] text-[#444] hover:bg-[#f4f4f4] disabled:opacity-40"
            aria-label={`Increase quantity for ${line.productTitle}`}
          >
            +
          </button>
        </div>
      </div>

      <p className="text-left text-[22px] font-medium text-[#2b2b2b] md:text-right">
        {line.formattedLineSubtotal}
      </p>
    </li>
  );
}

export default function CartPage() {
  const {
    lines,
    invalidLines,
    formattedSubtotal,
    itemCount,
    mode,
    error,
    replayMessage,
    hasInvalidItems,
    isLoading,
    clearCart,
  } = useCartSidebar();
  const isEmpty = lines.length === 0 && invalidLines.length === 0;

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-medium text-[#1f1f1f]">Your Cart</h1>
            <p className="mt-1 text-[14px] text-[#666]">
              {mode === "guest" ? "Guest cart" : "Authenticated cart"} · prices
              and stock are revalidated before checkout.
            </p>
          </div>
          {!isEmpty ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void clearCart()}
              className="rounded-full border border-[#d9b8b8] px-5 py-2 text-[14px] font-semibold text-[#9a3f3f] disabled:opacity-40"
            >
              Clear cart
            </button>
          ) : null}
        </div>

        {error || replayMessage ? (
          <div className="mt-5 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] px-4 py-3 text-[14px] text-[#704040]">
            {error || replayMessage}
          </div>
        ) : null}

        {hasInvalidItems ? (
          <div className="mt-5 rounded-xl border border-[#f0d4d4] bg-[#fff7f7] px-4 py-3 text-[14px] text-[#704040]">
            Some items are unavailable or need attention. Remove them before
            checkout.
          </div>
        ) : null}

        {isEmpty ? (
          <section className="mt-8 rounded-md border border-[#e1e1e1] bg-white p-8">
            <p className="text-[18px] text-[#333]">Your cart is currently empty.</p>
            <Link
              href="/collections"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[14px] font-semibold tracking-[0.06em] text-white"
            >
              CONTINUE SHOPPING
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <section>
              <div className="overflow-hidden rounded-md border border-[#e1e1e1] bg-white">
                <div className="hidden grid-cols-[minmax(0,1fr)_180px_180px] border-b border-[#e9e9e9] px-6 py-4 text-[16px] text-[#2b2b2b] md:grid">
                  <p>Product</p>
                  <p className="text-center">Quantity</p>
                  <p className="text-right">Total</p>
                </div>

                <ul>
                  {invalidLines.map((line) => (
                    <CartLineRow key={`invalid-${line.id}`} line={line} invalid />
                  ))}
                  {lines.map((line) => (
                    <CartLineRow key={line.id} line={line} />
                  ))}
                </ul>
              </div>
            </section>

            <aside className="h-fit rounded-md border border-[#e1e1e1] bg-[#efefef] p-6">
              <div className="flex items-center justify-between">
                <p className="text-[22px] text-[#2b2b2b]">
                  Subtotal ({itemCount} items)
                </p>
                <p className="text-[28px] font-semibold text-[#2b2b2b]">
                  {formattedSubtotal}
                </p>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-[#535353]">
                This is not a final checkout quote. Shipping, taxes, inventory,
                invalid items, and payment preparation will be handled in the
                checkout phase.
              </p>
              {hasInvalidItems ? (
                <button
                  type="button"
                  disabled
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-[14px] font-semibold tracking-[0.08em] text-white opacity-45"
                >
                  REMOVE INVALID ITEMS
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-[14px] font-semibold tracking-[0.08em] text-white"
                >
                  CHECK OUT
                </Link>
              )}
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
