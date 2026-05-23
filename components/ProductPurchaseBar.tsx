"use client";

import { useState } from "react";
import { useCartSidebar } from "./CartSidebar";
import type { ProductDetailViewModel } from "../lib/storefront/types/viewModels";

export default function ProductPurchaseBar({ product }: { product: ProductDetailViewModel }) {
  const { addLine, openCart, isLoading } = useCartSidebar();
  const [qty, setQty] = useState(1);

  const variant = product.primaryVariant ?? product.variants.find((item) => item.inStock);
  const image = variant?.images[0] ?? product.images[0] ?? product.image;

  const handleAddToCart = async () => {
    if (!variant) return;

    await addLine({
      productId: product.id,
      variantId: variant.id,
      productTitle: product.title,
      slug: product.slug,
      category: product.category?.title,
      variantTitle: variant.title,
      effectivePrice: variant.price.effectivePrice,
      image,
      quantity: qty,
      availableQuantity: variant.stockQuantity,
      inStock: variant.inStock,
      available: variant.isActive,
      stockLabel: variant.stockLabel,
    });
    openCart();
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div
          className="inline-flex h-12 items-stretch rounded-lg border border-[#d8d8d8] bg-white"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            className="w-11 text-lg font-medium text-[#111] transition-colors hover:bg-[#f5f5f5] disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex min-w-12 items-center justify-center border-x border-[#d8d8d8] text-[17px] font-medium tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            className="w-11 text-lg font-medium text-[#111] transition-colors hover:bg-[#f5f5f5]"
            onClick={() => setQty((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={!variant || !variant.inStock || isLoading}
          className="h-12 flex-1 min-w-[200px] bg-[#9ea600] px-6 text-[14px] font-semibold tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:max-w-none"
        >
          ADD TO CART
        </button>

        <button
          type="button"
          disabled
          className="inline-flex h-12 flex-1 min-w-[200px] items-center justify-center bg-[#3d3d3d] px-6 text-[14px] font-semibold tracking-[0.08em] text-white opacity-45 sm:max-w-none"
        >
          BUY IT NOW
        </button>
      </div>
    </div>
  );
}
