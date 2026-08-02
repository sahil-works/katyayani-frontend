"use client";

import { useQuery } from "@tanstack/react-query";
import { Dancing_Script } from "next/font/google";
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

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function ShopByCategoriesSection() {
  const categoriesQuery = useQuery(categoriesQueryOptions());
  const categories = categoriesQuery.data ?? [];

  return (
    <section className="bg-[#eeeee9] py-14">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <AnimateOnView animation="fadeInLeft" duration={0.8}>
            <p className={`${dancingScript.className} text-[24px] leading-none text-[#ea206d]`}>
              Browse by Style & Need
            </p>
            <h2 className="mt-3 text-[28px] leading-tight font-medium text-[#111] sm:text-[36px] sm:leading-none">
              Shop By Categories
            </h2>
          </AnimateOnView>
          <AnimateOnView animation="fadeInRight" delay={120} duration={0.8}>
            <p className="max-w-[360px] pt-2 text-[19px] leading-[1.35] text-[#555] sm:text-right">
              Easily find what you&apos;re looking for all neatly sorted by category.
            </p>
          </AnimateOnView>
        </div>

        {categoriesQuery.isLoading ? (
          <StorefrontSkeleton rows={5} label="Loading categories" />
        ) : categoriesQuery.isError ? (
          <StorefrontErrorState
            error={categoriesQuery.error}
            title="Could not load categories"
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
        ) : categories.length === 0 ? (
          <StorefrontEmptyState
            title="No categories found"
            description="Categories will appear here once they are active in the catalog."
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
            {categories.slice(0, 5).map((category, index) => (
              <AnimateOnView
                key={category.id}
                animation="zoomIn"
                delay={index * 90}
                duration={0.65}
              >
                <Link
                  href={buildProductListingHref({ categoryId: category.id })}
                  className="group block text-center"
                >
                  <article>
                    <div className="overflow-hidden rounded-[16px] bg-[#f7f7f5]">
                      <StorefrontImage
                        image={category.image}
                        width={245}
                        height={180}
                        priority={index < 3}
                        sizes="(min-width: 1024px) 245px, (min-width: 768px) 33vw, 50vw"
                        className="h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-3 text-[15px] leading-snug text-[#111] transition-colors group-hover:text-[#ea206d] sm:text-[18px] lg:text-[21px] lg:leading-none">
                      {category.title}
                    </h3>
                    {typeof category.productCount === "number" ? (
                      <p className="mt-1 text-[14px] text-[#888]">
                        {category.productCount} products
                      </p>
                    ) : null}
                  </article>
                </Link>
              </AnimateOnView>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
