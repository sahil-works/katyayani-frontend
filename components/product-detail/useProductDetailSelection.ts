import { useMemo, useState } from "react";
import type {
  ProductDetailViewModel,
  ProductVariantViewModel,
} from "../../lib/storefront/types/viewModels";

export function useProductDetailSelection(product: ProductDetailViewModel) {
  const selectableVariants = useMemo(
    () => product.variants.filter((variant) => variant.isActive),
    [product.variants],
  );
  const initialVariantId =
    product.primaryVariant?.isActive === true ? product.primaryVariant.id : "";
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);

  const selectedVariant = useMemo<ProductVariantViewModel | undefined>(
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

  return {
    selectableVariants,
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    selectedImages,
    selectedPrice,
    stockLabel,
    inStock,
  };
}
