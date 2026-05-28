import Link from "next/link";
import { buildProductListingHref } from "../../lib/storefront";
import type {
  ProductDetailViewModel,
  ProductPriceViewModel,
  ProductVariantViewModel,
} from "../../lib/storefront/types/viewModels";
import AddToCartPanel from "./AddToCartPanel";
import VariantSelector from "./VariantSelector";

type ProductSummaryPanelProps = {
  product: ProductDetailViewModel;
  selectedPrice: ProductPriceViewModel;
  selectedVariant?: ProductVariantViewModel;
  selectableVariants: ProductVariantViewModel[];
  stockLabel: string;
  inStock: boolean;
  canAddToCart: boolean;
  isAdding: boolean;
  onVariantChange: (variantId: string) => void;
  onAddToCart: () => void;
};

function PriceBlock({ price }: { price: ProductPriceViewModel }) {
  const priceLabel =
    price.minEffectivePrice !== price.maxEffectivePrice
      ? price.formattedPriceRange
      : price.formattedEffectivePrice;

  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <p className="text-[28px] font-medium tracking-[-0.03em] text-[#17130f] sm:text-[34px]">
        {priceLabel}
      </p>
      {price.hasSale ? (
        <p className="text-[17px] text-[#8a8276] line-through">
          {price.formattedPrice}
        </p>
      ) : null}
    </div>
  );
}

export default function ProductSummaryPanel({
  product,
  selectedPrice,
  selectedVariant,
  selectableVariants,
  stockLabel,
  inStock,
  canAddToCart,
  isAdding,
  onVariantChange,
  onAddToCart,
}: ProductSummaryPanelProps) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="rounded-[32px] border border-[#ece6da] bg-[#fffdf9] p-5 sm:p-8 lg:p-9">
        <div className="space-y-7">
          <div>
            {product.category ? (
              <Link
                href={buildProductListingHref({ categoryId: product.category.id })}
                className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#9ea600] transition-colors hover:text-[#6f7600]"
              >
                {product.category.title}
              </Link>
            ) : null}
            <h1 className="mt-3 text-[34px] font-medium leading-[1.05] tracking-[-0.04em] text-[#18140f] sm:text-[46px] lg:text-[52px]">
              {product.title}
            </h1>
            {product.shortDescription ? (
              <p className="mt-4 text-[15px] leading-7 text-[#6d675d]">
                {product.shortDescription}
              </p>
            ) : null}
          </div>

          <div className="border-y border-[#ebe5d8] py-5">
            <PriceBlock price={selectedPrice} />
          </div>

          <div className="grid grid-cols-1 gap-3 text-[13px] sm:grid-cols-2">
            {selectedVariant?.sku ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a9388]">
                  SKU
                </p>
                <p className="mt-1 font-medium text-[#1f1a14]">
                  {selectedVariant.sku}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a9388]">
                Availability
              </p>
              <p
                className={`mt-1 font-medium ${
                  inStock ? "text-[#5f6a00]" : "text-[#9a3f3f]"
                }`}
              >
                {stockLabel}
              </p>
            </div>
          </div>

          <VariantSelector
            variants={selectableVariants}
            selectedVariant={selectedVariant}
            onChange={onVariantChange}
          />

          <AddToCartPanel
            canAddToCart={canAddToCart}
            isAdding={isAdding}
            selectedVariant={selectedVariant}
            onAddToCart={onAddToCart}
          />
        </div>
      </div>
    </aside>
  );
}
