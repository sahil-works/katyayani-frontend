import type { ProductPriceViewModel } from "../../lib/storefront/types/viewModels";

type ProductPriceDisplayProps = {
  price: ProductPriceViewModel;
  size?: "card" | "detail";
  align?: "center" | "start";
};

export function ProductPriceDisplay({
  price,
  size = "card",
  align = "center",
}: ProductPriceDisplayProps) {
  const priceLabel =
    price.minEffectivePrice !== price.maxEffectivePrice
      ? price.formattedPriceRange
      : price.formattedEffectivePrice;

  const mainClass =
    size === "detail"
      ? "text-[22px] font-medium tracking-tight text-[#9ea600] sm:text-[24px]"
      : "text-[20px] font-medium text-[#9ea600]";

  const strikeClass =
    size === "detail"
      ? "text-[18px] text-[#7a7a7a] line-through sm:text-[20px]"
      : "text-[16px] text-[#7a7a7a] line-through";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 leading-none ${
        align === "start" ? "justify-start" : "justify-center"
      }`}
    >
      <span className={mainClass}>{priceLabel}</span>
      {price.hasSale ? (
        <span className={strikeClass}>{price.formattedPrice}</span>
      ) : null}
    </div>
  );
}
