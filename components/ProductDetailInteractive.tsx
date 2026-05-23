"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductDetailGallery from "./ProductDetailGallery";
import { useCartSidebar } from "./CartSidebar";
import type {
  ProductDetailViewModel,
  ProductPriceViewModel,
  ProductVariantViewModel,
} from "../lib/storefront/types/viewModels";

function getOptionLabel(options: ProductVariantViewModel["options"]) {
  const entries = Object.entries(options).filter(([, value]) => {
    return value !== null && value !== undefined && value !== "";
  });

  if (entries.length === 0) return "Default";

  return entries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" / ");
}

function PriceBlock({ price }: { price: ProductPriceViewModel }) {
  const priceLabel =
    price.minEffectivePrice !== price.maxEffectivePrice
      ? price.formattedPriceRange
      : price.formattedEffectivePrice;

  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-3">
      <p className="text-[22px] font-semibold text-[#111] sm:text-[24px]">
        {priceLabel}
      </p>
      {price.hasSale ? (
        <p className="text-[18px] text-[#777] line-through">
          {price.formattedPrice}
        </p>
      ) : null}
    </div>
  );
}

export default function ProductDetailInteractive({
  product,
}: {
  product: ProductDetailViewModel;
}) {
  const { addLine, openCart, isLoading: cartIsLoading } = useCartSidebar();
  const selectableVariants = product.variants.filter(
    (variant) => variant.isActive,
  );
  const initialVariantId =
    product.primaryVariant?.isActive === true ? product.primaryVariant.id : "";
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);

  const selectedVariant = useMemo(
    () =>
      selectableVariants.find((variant) => variant.id === selectedVariantId) ??
      selectableVariants.find((variant) => variant.inStock),
    [selectableVariants, selectedVariantId],
  );
  const selectedImages =
    selectedVariant && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images;
  const selectedPrice = selectedVariant?.price ?? product.price;
  const stockLabel = selectedVariant?.stockLabel ?? product.stockLabel;
  const inStock = selectedVariant?.inStock ?? product.inStock;
  const canAddToCart = Boolean(selectedVariant) && inStock && !cartIsLoading;

  async function handleAddToCart() {
    if (!selectedVariant) return;

    await addLine({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity: 1,
      productTitle: product.title,
      slug: product.slug,
      category: product.category?.title,
      variantTitle: selectedVariant.title,
      image: selectedImages[0] ?? product.image,
      effectivePrice: selectedPrice.effectivePrice,
      inStock,
      available: selectedVariant.isActive,
      stockLabel,
    });
    openCart();
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
      <ProductDetailGallery images={selectedImages} productName={product.title} />

      <div className="min-w-0 space-y-6 lg:pt-1">
        <div>
          {product.category ? (
            <Link
              href={`/new-arrivals?categoryId=${encodeURIComponent(product.category.id)}`}
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8a8a8a] hover:text-[#5f6a00]"
            >
              {product.category.title}
            </Link>
          ) : null}
          <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-[#111] sm:text-[34px] sm:leading-[1.2]">
            {product.title}
          </h1>
          <PriceBlock price={selectedPrice} />
        </div>

        <div className="space-y-4">
          {selectableVariants.length > 0 ? (
            <fieldset>
              <legend className="text-[15px] font-semibold text-[#222]">
                Select variant
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selectableVariants.map((variant) => {
                  const checked = variant.id === selectedVariant?.id;

                  return (
                    <label
                      key={variant.id}
                      className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                        checked
                          ? "border-[#9ea600] bg-[#fbfcf0]"
                          : "border-[#e2e2e2] bg-white hover:border-[#b8bd58]"
                      } ${variant.inStock ? "" : "opacity-65"}`}
                    >
                      <input
                        type="radio"
                        name="product-variant"
                        value={variant.id}
                        checked={checked}
                        onChange={() => setSelectedVariantId(variant.id)}
                        className="sr-only"
                      />
                      <span className="block text-[14px] font-semibold text-[#222]">
                        {variant.title}
                      </span>
                      <span className="mt-1 block text-[13px] text-[#666]">
                        {getOptionLabel(variant.options)}
                      </span>
                      <span
                        className={`mt-2 block text-[12px] font-semibold ${
                          variant.inStock ? "text-[#5f6a00]" : "text-[#9a3f3f]"
                        }`}
                      >
                        {variant.stockLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <div className="rounded-xl border border-[#e8e8e8] bg-[#fbfbf8] px-4 py-3 text-[14px] text-[#555]">
              This product has no selectable variants.
            </div>
          )}

          <div className="space-y-1 text-[15px] text-[#444]">
            {selectedVariant?.sku ? (
              <p>
                <span className="text-[#888]">Sku:</span>{" "}
                <span className="text-[#111]">{selectedVariant.sku}</span>
              </p>
            ) : null}
            <p>
              <span className="text-[#888]">Availability:</span>{" "}
              <span
                className={
                  inStock
                    ? "font-medium text-[#5f6a00]"
                    : "font-medium text-[#9a3f3f]"
                }
              >
                {stockLabel}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            disabled={!canAddToCart}
            onClick={() => void handleAddToCart()}
            className="h-12 flex-1 min-w-[200px] bg-[#9ea600] px-6 text-[14px] font-semibold tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {selectedVariant ? "ADD TO CART" : "SELECTABLE VARIANT UNAVAILABLE"}
          </button>
          <button
            type="button"
            disabled
            className="inline-flex h-12 flex-1 min-w-[200px] items-center justify-center bg-[#3d3d3d] px-6 text-[14px] font-semibold tracking-[0.08em] text-white opacity-45"
          >
            BUY IT NOW
          </button>
        </div>
        <p className="text-[12px] leading-relaxed text-[#777]">
          Cart and checkout integration will use this selected variant contract
          in the next commerce phase.
        </p>
      </div>
    </div>
  );
}
