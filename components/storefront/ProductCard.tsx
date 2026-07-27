"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { ProductCardViewModel } from "../../lib/storefront/types/viewModels";
import { useCartSidebar } from "../CartSidebar";
import AnimateOnView from "../AnimateOnView";
import { ProductPriceDisplay } from "./ProductPriceDisplay";
import { StorefrontImage } from "./StorefrontImage";

type ProductCardProps = {
  product: ProductCardViewModel;
  viewMode?: "grid" | "list";
  imagePriority?: boolean;
  /** Stagger delay for viewport entrance animation (ms). */
  animationDelay?: number;
};

export function ProductCard({
  product,
  viewMode = "grid",
  imagePriority = false,
  animationDelay = 0,
}: ProductCardProps) {
  const isList = viewMode === "list";
  const { addLine, openCart, isLoading: cartIsLoading } = useCartSidebar();
  const [isAdding, setIsAdding] = useState(false);

  const variant = product.primaryVariant;
  const canAddToCart =
    product.isActive &&
    product.inStock &&
    Boolean(variant?.id) &&
    Boolean(variant?.isActive) &&
    Boolean(variant?.inStock) &&
    !cartIsLoading &&
    !isAdding;

  async function handleAddToCart() {
    if (!variant || !canAddToCart) return;

    setIsAdding(true);
    try {
      await addLine({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
        productTitle: product.title,
        slug: product.slug,
        category: product.category?.title,
        variantTitle: variant.title,
        image: variant.images[0] ?? product.image,
        effectivePrice: variant.price.effectivePrice,
        availableQuantity: variant.stockQuantity,
        inStock: product.inStock,
        available: variant.isActive,
        stockLabel: product.stockLabel,
      });
      openCart();
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <AnimateOnView
      as="article"
      animation="fadeInUp"
      delay={animationDelay}
      duration={0.7}
      className={
        isList
          ? "flex flex-col gap-4 border border-[#efefef] p-4 sm:flex-row sm:items-center"
          : "text-center"
      }
    >
      <Link
        href={product.href}
        className={isList ? "contents" : "group block"}
      >
        <div
          className={
            isList
              ? "relative h-[220px] w-full overflow-hidden rounded-[14px] bg-[#f7f7f5] sm:w-[190px]"
              : "relative overflow-hidden rounded-[18px] bg-[#f7f7f5]"
          }
        >
          <StorefrontImage
            image={product.image}
            width={305}
            height={385}
            priority={imagePriority}
            sizes={
              isList
                ? "(min-width: 640px) 190px, 100vw"
                : "(min-width: 1280px) 305px, (min-width: 640px) 50vw, 100vw"
            }
            className={
              isList
                ? "h-[220px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:w-[190px]"
                : "h-[380px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            }
          />
          {!product.inStock ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#555]">
              Out of stock
            </span>
          ) : null}
        </div>

        <div className={isList ? "min-w-0 sm:text-left" : ""}>
          {product.category ? (
            <p
              className={`mt-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a8a8a] ${
                isList ? "text-left" : "text-center"
              }`}
            >
              {product.category.title}
            </p>
          ) : null}
          <h3
            className={`text-[20px] leading-[1.15] font-medium text-[#222] ${
              isList
                ? "mt-2 text-left"
                : "mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-center"
            }`}
          >
            {product.title}
          </h3>
          <p
            className={`mt-2 text-[13px] font-medium ${
              product.inStock ? "text-[#5f6a00]" : "text-[#9a3f3f]"
            } ${isList ? "text-left" : "text-center"}`}
          >
            {product.stockLabel}
          </p>
        </div>
      </Link>

      <div
        className={`mt-2 flex flex-col gap-3 ${
          isList ? "sm:ml-auto sm:items-end sm:text-left" : "items-center"
        }`}
      >
        <ProductPriceDisplay
          price={product.price}
          align={isList ? "start" : "center"}
        />

        {canAddToCart ? (
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={!canAddToCart}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[5px] bg-[#111] px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c9c0b0] ${
              isList ? "w-full sm:w-auto" : "w-full max-w-[220px]"
            }`}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingBag className="size-4" aria-hidden />
            {isAdding ? "Adding..." : "Add to cart"}
          </button>
        ) : product.inStock ? (
          <Link
            href={product.href}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[5px] border border-[#111] bg-white px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#111] transition-colors hover:bg-[#111] hover:text-white ${
              isList ? "w-full sm:w-auto" : "w-full max-w-[220px]"
            }`}
          >
            {product.hasMultipleVariants ? "View options" : "View product"}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={`inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-[5px] bg-[#e8e8e8] px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#666] ${
              isList ? "w-full sm:w-auto" : "w-full max-w-[220px]"
            }`}
          >
            <ShoppingBag className="size-4" aria-hidden />
            Sold out
          </button>
        )}
      </div>
    </AnimateOnView>
  );
}
