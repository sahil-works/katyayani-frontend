"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProductVariantViewModel } from "../../lib/storefront/types/viewModels";

type AddToCartPanelProps = {
  canAddToCart: boolean;
  isAdding: boolean;
  inStock: boolean;
  quantity: number;
  maxQuantity: number;
  selectedVariant?: ProductVariantViewModel;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
};

export default function AddToCartPanel({
  canAddToCart,
  isAdding,
  inStock,
  quantity,
  maxQuantity,
  selectedVariant,
  onQuantityChange,
  onAddToCart,
}: AddToCartPanelProps) {
  const [mounted, setMounted] = useState(false);
  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxQuantity && inStock;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const controls = (
    <div className="flex items-stretch gap-2.5 sm:gap-3">
      <div className="inline-flex h-12 shrink-0 items-center rounded-full border border-[#d9d9d9] bg-white">
        <button
          type="button"
          disabled={!canDecrease}
          onClick={() => onQuantityChange(quantity - 1)}
          className="grid h-12 w-11 place-items-center text-[18px] text-[#333] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:text-[#bbb] sm:w-12"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-8 text-center text-[15px] font-medium text-[#111] sm:min-w-10">
          {quantity}
        </span>
        <button
          type="button"
          disabled={!canIncrease}
          onClick={() => onQuantityChange(quantity + 1)}
          className="grid h-12 w-11 place-items-center text-[18px] text-[#333] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:text-[#bbb] sm:w-12"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        disabled={!canAddToCart}
        onClick={onAddToCart}
        className={`h-12 min-w-0 flex-1 rounded-full px-4 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-6 sm:text-[13px] sm:tracking-[0.14em] ${
          inStock
            ? "bg-[#111] text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c9c0b0]"
            : "cursor-not-allowed bg-[#e8e8e8] text-[#666]"
        }`}
      >
        {isAdding ? "Adding..." : inStock ? "Add to cart" : "Sold out"}
      </button>
    </div>
  );

  const mobileBar =
    mounted &&
    createPortal(
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="border-t border-[#ececec] px-3 pt-3 pb-3 shadow-[0_-6px_20px_rgba(0,0,0,0.06)]">
          <div className="mx-auto max-w-[1320px]">{controls}</div>
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="space-y-4">
      {/* Inline on tablet/desktop */}
      <div className="hidden sm:block">{controls}</div>

      {mobileBar}

      {/* Reserve space so content never peeks under the solid bar */}
      <div
        className="sm:hidden"
        style={{ height: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-hidden
      />

      {!selectedVariant ? (
        <p className="text-[13px] text-[#9a3f3f]">Please select an available variant.</p>
      ) : null}
    </div>
  );
}
