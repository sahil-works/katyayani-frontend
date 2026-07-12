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
  const canDecrease = quantity > 1;
  const canIncrease = quantity < maxQuantity && inStock;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="inline-flex h-12 shrink-0 items-center rounded-full border border-[#d9d9d9] bg-white">
          <button
            type="button"
            disabled={!canDecrease}
            onClick={() => onQuantityChange(quantity - 1)}
            className="grid h-12 w-12 place-items-center text-[18px] text-[#333] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:text-[#bbb]"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-10 text-center text-[15px] font-medium text-[#111]">
            {quantity}
          </span>
          <button
            type="button"
            disabled={!canIncrease}
            onClick={() => onQuantityChange(quantity + 1)}
            className="grid h-12 w-12 place-items-center text-[18px] text-[#333] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:text-[#bbb]"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={!canAddToCart}
          onClick={onAddToCart}
          className={`h-12 flex-1 rounded-full px-6 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
            inStock
              ? "bg-[#111] text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#c9c0b0]"
              : "cursor-not-allowed bg-[#e8e8e8] text-[#666]"
          }`}
        >
          {isAdding ? "Adding..." : inStock ? "Add to cart" : "Sold out"}
        </button>
      </div>

      {!selectedVariant ? (
        <p className="text-[13px] text-[#9a3f3f]">Please select an available variant.</p>
      ) : null}
    </div>
  );
}
