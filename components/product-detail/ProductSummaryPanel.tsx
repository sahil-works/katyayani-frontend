import Link from "next/link";
import { Lock } from "lucide-react";
import { buildProductListingHref } from "../../lib/storefront";
import type {
  ProductDetailViewModel,
  ProductPriceViewModel,
  ProductVariantViewModel,
} from "../../lib/storefront/types/viewModels";
import { ProductPriceDisplay } from "../storefront/ProductPriceDisplay";
import AddToCartPanel from "./AddToCartPanel";
import ProductInfoAccordion from "./ProductInfoAccordion";
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
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onVariantChange: (variantId: string) => void;
  onAddToCart: () => void;
};

export default function ProductSummaryPanel({
  product,
  selectedPrice,
  selectedVariant,
  selectableVariants,
  stockLabel,
  inStock,
  canAddToCart,
  isAdding,
  quantity,
  maxQuantity,
  onQuantityChange,
  onVariantChange,
  onAddToCart,
}: ProductSummaryPanelProps) {
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="space-y-5 bg-white px-1 sm:px-2 lg:px-0">
        {!inStock ? (
          <span className="inline-block rounded-sm border border-[#d64545] px-3 py-1 text-[12px] font-medium uppercase tracking-[0.08em] text-[#d64545]">
            Sold out
          </span>
        ) : null}

        <div>
          {product.categories.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {product.categories.map((category, index) => (
                <span key={category.id} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-[11px] text-[#c9c9c9]">
                      •
                    </span>
                  ) : null}
                  <Link
                    href={buildProductListingHref({ categoryId: category.id })}
                    className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#888] transition-colors hover:text-[#111]"
                  >
                    {category.title}
                  </Link>
                </span>
              ))}
            </div>
          ) : null}
          <h1 className="mt-2 text-[26px] font-normal leading-[1.2] tracking-tight text-[#111] sm:text-[30px]">
            {product.title}
          </h1>
        </div>

        <ProductPriceDisplay price={selectedPrice} size="detail" align="start" />

        <hr className="border-[#e8e8e8]" />

        <VariantSelector
          variants={selectableVariants}
          selectedVariant={selectedVariant}
          onChange={onVariantChange}
        />

        <AddToCartPanel
          canAddToCart={canAddToCart}
          isAdding={isAdding}
          inStock={inStock}
          quantity={quantity}
          maxQuantity={maxQuantity}
          selectedVariant={selectedVariant}
          onQuantityChange={onQuantityChange}
          onAddToCart={onAddToCart}
        />

        <hr className="border-[#e8e8e8]" />

        <dl className="space-y-2 text-[14px] text-[#333]">
          {selectedVariant?.sku ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-[#666]">Sku:</dt>
              <dd className="font-medium">{selectedVariant.sku}</dd>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-[#666]">Available:</dt>
            <dd className={`font-medium ${inStock ? "text-[#111]" : "text-[#d64545]"}`}>
              {stockLabel}
            </dd>
          </div>
        </dl>

        <ProductInfoAccordion description={product.description} variant="sidebar" />

        <div className="flex items-center gap-2 border-t border-[#e8e8e8] pt-4 text-[13px] text-[#666]">
          <Lock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          <span>Secure payment</span>
        </div>

        <div className="relative rounded border border-[#e5e5e5] px-4 pb-5 pt-6 text-center">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[12px] text-[#666]">
            Guarantee Safe Checkout
          </span>
          <p className="text-[14px] font-medium text-[#111]">
            100% Secure Payment By Razorpay
          </p>
          <p className="mt-2 text-[11px] tracking-wide text-[#888]">
            Visa · UPI · RuPay · Mastercard · Amex
          </p>
        </div>
      </div>
    </aside>
  );
}
