"use client";

import { useQuery } from "@tanstack/react-query";
import { productsQueryOptions } from "../lib/api";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "./storefront/AsyncStates";
import { ProductCard } from "./storefront/ProductCard";

export default function ShopLatestCollectionSection() {
  const productsQuery = useQuery(
    productsQueryOptions({ limit: 4, tag: "latest" }),
  );
  const products = productsQuery.data?.items ?? [];

  return (
    <section className="bg-[#f5f5f5] py-16">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-[43px] leading-none font-medium text-[#111]">
            Shop Latest Collection
          </h2>
          <p className="mt-3 text-[19px] leading-[1.35] text-[#6c6c6c]">
            Be the first to explore our brand-new arrivals, crafted just for you.
          </p>
        </div>

        {productsQuery.isLoading ? (
          <div className="mt-10">
            <StorefrontSkeleton rows={4} label="Loading latest collection" />
          </div>
        ) : productsQuery.isError ? (
          <div className="mt-10">
            <StorefrontErrorState
              error={productsQuery.error}
              title="Could not load latest collection"
              action={
                <button
                  type="button"
                  onClick={() => productsQuery.refetch()}
                  className="text-[14px] font-semibold text-[#8a2f2f] underline"
                >
                  Retry
                </button>
              }
            />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10">
            <StorefrontEmptyState
              title="No latest products found"
              description="Latest collection products will appear here once they are active."
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                imagePriority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
