"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartSidebar } from "./CartSidebar";
import type { ProductDetail } from "../lib/productDetail";

export default function ProductPurchaseBar({ product }: { product: ProductDetail }) {
  const { addLine, openCart } = useCartSidebar();
  const [qty, setQty] = useState(1);

  const imageSrc = product.images[0]?.src ?? "/assets/images/banner-one.png";

  const handleAddToCart = () => {
    addLine({
      id: product.sku,
      name: product.name,
      subtitle: product.collectionLabel,
      unitPrice: product.priceInr,
      imageSrc,
      quantity: qty,
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
          <span className="flex min-w-[3rem] items-center justify-center border-x border-[#d8d8d8] text-[17px] font-medium tabular-nums">
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
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="h-12 flex-1 min-w-[200px] bg-[#9ea600] px-6 text-[14px] font-semibold tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 sm:max-w-none"
        >
          ADD TO CART
        </button>

        <Link
          href="/checkout"
          className="inline-flex h-12 flex-1 min-w-[200px] items-center justify-center bg-[#3d3d3d] px-6 text-[14px] font-semibold tracking-[0.08em] text-white transition-opacity hover:opacity-90 sm:max-w-none"
        >
          BUY IT NOW
        </Link>
      </div>
    </div>
  );
}
