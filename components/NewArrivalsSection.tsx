"use client";

import { useQuery } from "@tanstack/react-query";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { productsQueryOptions } from "../lib/api";
import { buildProductListingHref } from "../lib/storefront";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "./storefront/AsyncStates";
import { ProductCard } from "./storefront/ProductCard";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function NewArrivalsSection() {
  const productsQuery = useQuery(
    productsQueryOptions({ limit: 8, tag: "new-arrivals" }),
  );
  const products = productsQuery.data?.items ?? [];

  return (
    <section className="bg-[#f1f1f1] py-14">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className={`${dancingScript.className} text-[24px] leading-none text-[#9ea600]`}>
              Be the first to try our new collection
            </p>
            <h2 className="mt-3 text-[43px] leading-none font-medium text-[#111]">
              New Arrivals
            </h2>
          </div>
          <p className="max-w-[360px] pt-2 text-[19px] leading-[1.35] text-[#555] sm:text-right">
            New season, new vibes, new arrivals because you deserve the freshest
            picks.
          </p>
        </div>

        {productsQuery.isLoading ? (
          <StorefrontSkeleton rows={8} label="Loading new arrivals" />
        ) : productsQuery.isError ? (
          <StorefrontErrorState
            error={productsQuery.error}
            title="Could not load new arrivals"
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
        ) : products.length === 0 ? (
          <StorefrontEmptyState
            title="No new arrivals yet"
            description="Fresh products will appear here as soon as they are published."
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                imagePriority={index < 4}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href={buildProductListingHref({ tag: "new-arrivals" })}
            className="min-w-[118px] bg-[#9ea600] px-6 py-3 text-center text-[20px] font-medium text-white"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
