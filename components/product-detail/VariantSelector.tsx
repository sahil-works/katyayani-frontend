import type { ProductVariantViewModel } from "../../lib/storefront/types/viewModels";

type VariantSelectorProps = {
  variants: ProductVariantViewModel[];
  selectedVariant?: ProductVariantViewModel;
  onChange: (variantId: string) => void;
};

function getOptionLabel(options: ProductVariantViewModel["options"]) {
  const entries = Object.entries(options).filter(([, value]) => {
    return value !== null && value !== undefined && value !== "";
  });

  if (entries.length === 0) return "Default";

  return entries.map(([, value]) => String(value)).join(" / ");
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onChange,
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return (
      <p className="text-[14px] text-[#666]">This product has no selectable variants.</p>
    );
  }

  if (variants.length === 1) {
    const variant = variants[0];
    const optionLabel = getOptionLabel(variant.options);
    const label = [optionLabel, variant.inStock ? null : "Sold out"]
      .filter(Boolean)
      .join(" - ");

    return (
      <div className="rounded-full border border-[#d9d9d9] bg-white px-5 py-3.5 text-[14px] text-[#333]">
        {label}
      </div>
    );
  }

  return (
    <label className="block">
      <span className="sr-only">Select variant</span>
      <select
        value={selectedVariant?.id ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-[#d9d9d9] bg-white px-5 text-[14px] text-[#333] outline-none transition-colors focus:border-[#111]"
      >
        {variants.map((variant) => {
          const optionLabel = getOptionLabel(variant.options);
          const suffix = variant.inStock ? "" : " - Sold out";

          return (
            <option key={variant.id} value={variant.id}>
              {optionLabel}
              {suffix}
            </option>
          );
        })}
      </select>
    </label>
  );
}
