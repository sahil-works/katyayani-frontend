"use client";

import { useQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "../../lib/api";
import AnimateOnView from "../AnimateOnView";
import { ProductCard } from "../storefront/ProductCard";
import {
  StorefrontErrorState,
  StorefrontSkeleton,
} from "../storefront/AsyncStates";

type RelatedProductsSectionProps = {
  currentProductId: string;
  currentProductSlug: string;
  categoryId?: string;
};

const RELATED_LIMIT = 5;
const DISPLAY_LIMIT = 4;

export default function RelatedProductsSection({
  currentProductId,
  currentProductSlug,
  categoryId,
}: RelatedProductsSectionProps) {
  const relatedQuery = useQuery({
    ...productsQueryOptions({
      limit: RELATED_LIMIT,
      categoryId,
    }),
    enabled: Boolean(categoryId),
  });
  const featuredQuery = useQuery(
    productsQueryOptions({ limit: RELATED_LIMIT, tag: "featured" }),
  );

  const relatedProducts = (relatedQuery.data?.items ?? []).filter(
    (product) =>
      product.id !== currentProductId && product.slug !== currentProductSlug,
  );
  const featuredProducts = (featuredQuery.data?.items ?? []).filter(
    (product) =>
      product.id !== currentProductId &&
      product.slug !== currentProductSlug &&
      !relatedProducts.some((related) => related.id === product.id),
  );
  const products = (
    relatedProducts.length > 0 ? relatedProducts : featuredProducts
  ).slice(0, DISPLAY_LIMIT);
  const isLoading =
    (Boolean(categoryId) && relatedQuery.isLoading) ||
    (relatedProducts.length === 0 && featuredQuery.isLoading);
  const isError =
    (Boolean(categoryId) && relatedQuery.isError) ||
    (relatedProducts.length === 0 && featuredQuery.isError);

  if (isLoading) {
    return (
      <section className="bg-[#fbfaf6] py-14 sm:py-18">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <StorefrontSkeleton rows={4} label="Loading related products" />
        </div>
      </section>
    );
  }

  if (isError && products.length === 0) {
    return (
      <section className="bg-[#fbfaf6] py-14 sm:py-18">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
          <StorefrontErrorState
            title="Could not load related products"
            error={relatedQuery.error ?? featuredQuery.error}
          />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fbfaf6] py-14 sm:py-18" aria-labelledby="related-products-heading">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <AnimateOnView
          animation="fadeInUp"
          duration={0.75}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#ea206d]">
              Curated for you
            </p>
            <h2
              id="related-products-heading"
              className="mt-2 text-[30px] font-medium leading-none tracking-[-0.02em] text-[#16130f] sm:text-[40px]"
            >
              You May Also Like
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-6 text-[#6d675d] sm:text-right">
            {relatedProducts.length > 0
              ? "More pieces from the same collection mood."
              : "Featured edits selected for a similar boutique feel."}
          </p>
        </AnimateOnView>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              imagePriority={index < 2}
              animationDelay={(index % 4) * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
