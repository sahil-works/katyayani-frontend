"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { categoriesQueryOptions } from "../lib/api";
import { buildProductListingHref } from "../lib/storefront";
import AnimateOnView from "./AnimateOnView";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "./storefront/AsyncStates";
import { StorefrontImage } from "./storefront/StorefrontImage";

export default function CollectionsContent() {
  const categoriesQuery = useQuery(categoriesQueryOptions());
  const categories = categoriesQuery.data ?? [];

  if (categoriesQuery.isLoading) {
    return <StorefrontSkeleton rows={6} label="Loading collections" />;
  }

  if (categoriesQuery.isError) {
    return (
      <StorefrontErrorState
        error={categoriesQuery.error}
        title="Could not load collections"
        action={
          <button
            type="button"
            onClick={() => categoriesQuery.refetch()}
            className="text-[14px] font-semibold text-[#8a2f2f] underline"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (categories.length === 0) {
    return (
      <StorefrontEmptyState
        title="No collections found"
        description="Active storefront categories will appear here once they are published."
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => (
        <AnimateOnView
          key={category.id}
          animation="fadeInUp"
          delay={(index % 3) * 100}
          duration={0.7}
        >
          <Link
            href={buildProductListingHref({ categoryId: category.id })}
            className="group block"
          >
            <article>
              <div className="overflow-hidden rounded-[14px] bg-[#f7f7f5]">
                <StorefrontImage
                  image={category.image}
                  width={420}
                  height={460}
                  priority={index < 3}
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                  className="h-[320px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h2 className="mt-4 text-center text-[24px] leading-none font-normal text-[#2e2e2e]">
                {category.title}
              </h2>
              {typeof category.productCount === "number" ? (
                <p className="mt-2 text-center text-[18px] leading-none text-[#9f9f9f]">
                  {category.productCount} products
                </p>
              ) : null}
            </article>
          </Link>
        </AnimateOnView>
      ))}
    </section>
  );
}
