"use client";

import { useState } from "react";
import { useCartSidebar } from "./CartSidebar";
import ProductHeroGallery from "./product-detail/ProductHeroGallery";
import ProductSummaryPanel from "./product-detail/ProductSummaryPanel";
import { useProductDetailSelection } from "./product-detail/useProductDetailSelection";
import type { ProductDetailViewModel } from "../lib/storefront/types/viewModels";

const MAX_CART_QUANTITY = 10;

export default function ProductDetailInteractive({
  product,
}: {
  product: ProductDetailViewModel;
}) {
  const { addLine, openCart, isLoading: cartIsLoading } = useCartSidebar();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const {
    selectableVariants,
    selectedVariant,
    setSelectedVariantId,
    selectedImages,
    selectedPrice,
    stockLabel,
    inStock,
  } = useProductDetailSelection(product);
  const maxQuantity = Math.min(
    selectedVariant?.stockQuantity ?? MAX_CART_QUANTITY,
    MAX_CART_QUANTITY,
  );
  const canAddToCart = Boolean(selectedVariant) && inStock && !cartIsLoading && !isAdding;

  function handleVariantChange(variantId: string) {
    setSelectedVariantId(variantId);
    setQuantity(1);
  }

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(Math.min(Math.max(1, nextQuantity), maxQuantity));
  }

  async function handleAddToCart() {
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      await addLine({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        productTitle: product.title,
        slug: product.slug,
        category: product.category?.title,
        variantTitle: selectedVariant.title,
        image: selectedImages[0] ?? product.image,
        effectivePrice: selectedPrice.effectivePrice,
        availableQuantity: selectedVariant.stockQuantity,
        inStock,
        available: selectedVariant.isActive,
        stockLabel,
      });
      openCart();
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,420px)] lg:items-start lg:gap-10 xl:gap-14">
      <ProductHeroGallery
        key={selectedVariant?.id ?? product.id}
        images={selectedImages}
        productName={product.title}
      />
      <ProductSummaryPanel
        product={product}
        selectedPrice={selectedPrice}
        selectedVariant={selectedVariant}
        selectableVariants={selectableVariants}
        stockLabel={stockLabel}
        inStock={inStock}
        canAddToCart={canAddToCart}
        isAdding={isAdding}
        quantity={quantity}
        maxQuantity={maxQuantity}
        onQuantityChange={handleQuantityChange}
        onVariantChange={handleVariantChange}
        onAddToCart={() => void handleAddToCart()}
      />
    </div>
  );
}
