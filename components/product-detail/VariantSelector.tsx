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
      <div className="rounded-full border border-[#e4ded2] bg-[#fbfaf6] px-5 py-3 text-[14px] text-[#6a6256]">
        This product has no selectable variants.
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a857b]">
        Select variant
      </legend>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {variants.map((variant) => {
          const checked = variant.id === selectedVariant?.id;
          const optionLabel = getOptionLabel(variant.options);

          return (
            <label
              key={variant.id}
              className={`group relative cursor-pointer rounded-full border px-4 py-3 transition-all duration-200 ${
                checked
                  ? "border-[#1f1a14] bg-[#1f1a14] text-white"
                  : "border-[#ded7ca] bg-white text-[#241f18] hover:border-[#9ea600] hover:bg-[#fbfaf6]"
              } ${variant.inStock ? "" : "opacity-55"}`}
            >
              <input
                type="radio"
                name="product-variant"
                value={variant.id}
                checked={checked}
                onChange={() => onChange(variant.id)}
                className="sr-only"
              />
              <span className="block text-[13px] font-semibold uppercase tracking-[0.08em]">
                {variant.title}
              </span>
              <span
                className={`mt-0.5 block text-[12px] ${
                  checked ? "text-white/75" : "text-[#7b7469]"
                }`}
              >
                {optionLabel}
              </span>
              {!variant.inStock ? (
                <span
                  className={`mt-1 block text-[11px] font-medium ${
                    checked ? "text-white/70" : "text-[#9a3f3f]"
                  }`}
                >
                  {variant.stockLabel}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
