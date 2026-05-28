import type { ProductVariantViewModel } from "../../lib/storefront/types/viewModels";

type AddToCartPanelProps = {
  canAddToCart: boolean;
  isAdding: boolean;
  selectedVariant?: ProductVariantViewModel;
  onAddToCart: () => void;
};

export default function AddToCartPanel({
  canAddToCart,
  isAdding,
  selectedVariant,
  onAddToCart,
}: AddToCartPanelProps) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={!canAddToCart}
        onClick={onAddToCart}
        className="h-14 w-full rounded-full bg-[#1f1a14] px-8 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#3a3329] disabled:cursor-not-allowed disabled:bg-[#c9c0b0] disabled:text-white/80"
      >
        {isAdding
          ? "Adding to bag"
          : selectedVariant
            ? "Add to cart"
            : "Selectable variant unavailable"}
      </button>
      <p className="text-center text-[12px] leading-5 text-[#7a7469]">
        Prices and stock are revalidated by the backend cart and checkout quote.
      </p>
    </div>
  );
}
