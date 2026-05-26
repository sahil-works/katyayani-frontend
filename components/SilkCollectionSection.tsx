"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { productsQueryOptions } from "../lib/api";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "./storefront/AsyncStates";
import { ProductCard } from "./storefront/ProductCard";

export default function SilkCollectionSection() {
  const productsQuery = useQuery(
    productsQueryOptions({ limit: 5, tag: "silk" }),
  );
  const products = productsQuery.data?.items ?? [];

  return (
    <section className="bg-[#f3f3f3] pt-14 sm:pt-16" aria-labelledby="silk-collection-heading">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <h2
          id="silk-collection-heading"
          className="mx-auto max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[32px] leading-none font-medium text-[#111] sm:text-[40px] lg:text-[43px]"
        >
          Silk Collection
        </h2>

        {productsQuery.isLoading ? (
          <div className="mt-10">
            <StorefrontSkeleton rows={5} label="Loading silk products" />
          </div>
        ) : productsQuery.isError ? (
          <div className="mt-10">
            <StorefrontErrorState
              error={productsQuery.error}
              title="Could not load silk products"
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
              title="No silk products found"
              description="Silk collection products will appear here once they are active."
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                imagePriority={index < 3}
              />
            ))}
          </div>
        )}

        <div className="pb-12 pt-10 text-center">
          <Link
            href="/collections"
            className="text-[13px] font-semibold tracking-[0.08em] text-[#222] underline underline-offset-[5px]"
          >
            SHOW ALL
          </Link>
        </div>
      </div>

      <div className="bg-black">
        <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-6 px-6 py-8 sm:flex-row sm:items-center lg:px-10">
          <div>
            <h3 className="text-[34px] leading-none font-medium text-white">New Collection</h3>
            <p className="mt-3 text-[20px] text-white/85">Discover the Latest Trends & Styles</p>
          </div>
          <Link
            href="/collections"
            className="inline-flex min-h-[52px] min-w-[210px] items-center justify-center rounded-full border border-white/80 px-8 text-[15px] font-medium tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-black"
          >
            SHOP COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
}
