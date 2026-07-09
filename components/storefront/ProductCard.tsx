import Link from "next/link";
import type { ProductCardViewModel } from "../../lib/storefront/types/viewModels";
import { ProductPriceDisplay } from "./ProductPriceDisplay";
import { StorefrontImage } from "./StorefrontImage";

type ProductCardProps = {
  product: ProductCardViewModel;
  viewMode?: "grid" | "list";
  imagePriority?: boolean;
};

export function ProductCard({
  product,
  viewMode = "grid",
  imagePriority = false,
}: ProductCardProps) {
  const isList = viewMode === "list";

  return (
    <article
      className={
        isList
          ? "flex flex-col gap-4 border border-[#efefef] p-4 sm:flex-row sm:items-center"
          : "text-center"
      }
    >
      <Link
        href={product.href}
        className={isList ? "contents" : "group block"}
      >
        <div
          className={
            isList
              ? "relative h-[220px] w-full overflow-hidden rounded-[14px] bg-[#f7f7f5] sm:w-[190px]"
              : "relative overflow-hidden rounded-[18px] bg-[#f7f7f5]"
          }
        >
          <StorefrontImage
            image={product.image}
            width={305}
            height={385}
            priority={imagePriority}
            sizes={
              isList
                ? "(min-width: 640px) 190px, 100vw"
                : "(min-width: 1280px) 305px, (min-width: 640px) 50vw, 100vw"
            }
            className={
              isList
                ? "h-[220px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:w-[190px]"
                : "h-[380px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            }
          />
          {!product.inStock ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#555]">
              Out of stock
            </span>
          ) : null}
        </div>

        <div className={isList ? "min-w-0 sm:text-left" : ""}>
          {product.category ? (
            <p
              className={`mt-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[#8a8a8a] ${
                isList ? "text-left" : "text-center"
              }`}
            >
              {product.category.title}
            </p>
          ) : null}
          <h3
            className={`text-[20px] leading-[1.15] font-medium text-[#222] ${
              isList
                ? "mt-2 text-left"
                : "mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-center"
            }`}
          >
            {product.title}
          </h3>
          <p
            className={`mt-2 text-[13px] font-medium ${
              product.inStock ? "text-[#5f6a00]" : "text-[#9a3f3f]"
            } ${isList ? "text-left" : "text-center"}`}
          >
            {product.stockLabel}
          </p>
        </div>
      </Link>

      <div className={`mt-2 ${isList ? "sm:text-left" : ""}`}>
        <ProductPriceDisplay
          price={product.price}
          align={isList ? "start" : "center"}
        />
      </div>
    </article>
  );
}
