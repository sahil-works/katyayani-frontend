"use client";

import { useState } from "react";
import { useCartSidebar } from "./CartSidebar";
import ProductHeroGallery from "./product-detail/ProductHeroGallery";
import ProductSummaryPanel from "./product-detail/ProductSummaryPanel";
import { useProductDetailSelection } from "./product-detail/useProductDetailSelection";
import type { ProductDetailViewModel } from "../lib/storefront/types/viewModels";

export default function ProductDetailInteractive({
  product,
}: {
  product: ProductDetailViewModel;
}) {
  const { addLine, openCart, isLoading: cartIsLoading } = useCartSidebar();
  const [isAdding, setIsAdding] = useState(false);
  const {
    selectableVariants,
    selectedVariant,
    setSelectedVariantId,
    selectedImages,
    selectedPrice,
    stockLabel,
    inStock,
  } = useProductDetailSelection(product);
  const canAddToCart = Boolean(selectedVariant) && inStock && !cartIsLoading && !isAdding;

  async function handleAddToCart() {
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
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
    <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)] lg:items-start lg:gap-12 xl:gap-16">
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
        onVariantChange={setSelectedVariantId}
        onAddToCart={() => void handleAddToCart()}
      />
    </div>
  );
}
