"use client";

import { useQuery } from "@tanstack/react-query";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { productsQueryOptions, type GetProductsParams } from "../lib/api";
import AnimateOnView from "./AnimateOnView";
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

type HomeProductSectionProps = {
  title: string;
  eyebrow?: string;
  description: string;
  params: GetProductsParams;
  className?: string;
  gridClassName?: string;
  skeletonRows?: number;
  emptyTitle: string;
  emptyDescription: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  imagePriorityCount?: number;
};

export default function HomeProductSection({
  title,
  eyebrow,
  description,
  params,
  className = "bg-[#f5f5f5] py-16",
  gridClassName = "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4",
  skeletonRows = 4,
  emptyTitle,
  emptyDescription,
  viewAllHref,
  viewAllLabel = "View all",
  imagePriorityCount = 4,
}: HomeProductSectionProps) {
  const productsQuery = useQuery(productsQueryOptions(params));
  const products = productsQuery.data?.items ?? [];

  return (
    <section className={className}>
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <AnimateOnView animation="fadeInLeft" duration={0.8}>
            {eyebrow ? (
              <p className={`${dancingScript.className} text-[24px] leading-none text-[#ea206d]`}>
                {eyebrow}
              </p>
            ) : null}
            <h2 className={`${eyebrow ? "mt-3" : ""} text-[28px] leading-tight font-medium text-[#111] sm:text-[36px] sm:leading-none`}>
              {title}
            </h2>
          </AnimateOnView>
          <AnimateOnView animation="fadeInRight" delay={120} duration={0.8}>
            <p className="max-w-[360px] pt-2 text-[19px] leading-[1.35] text-[#555] sm:text-right">
              {description}
            </p>
          </AnimateOnView>
        </div>

        {productsQuery.isLoading ? (
          <StorefrontSkeleton rows={skeletonRows} label={`Loading ${title.toLowerCase()}`} />
        ) : productsQuery.isError ? (
          <StorefrontErrorState
            error={productsQuery.error}
            title={`Could not load ${title.toLowerCase()}`}
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
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div className={gridClassName}>
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                imagePriority={index < imagePriorityCount}
                animationDelay={(index % 4) * 100}
              />
            ))}
          </div>
        )}

        {viewAllHref ? (
          <AnimateOnView
            animation="fadeInUp"
            delay={150}
            className="mt-10 flex justify-center"
          >
            <Link
              href={viewAllHref}
              className="min-w-[118px] rounded-[5px] bg-[#ea206d] px-6 py-3 text-center text-[20px] font-medium text-white"
            >
              {viewAllLabel}
            </Link>
          </AnimateOnView>
        ) : null}
      </div>
    </section>
  );
}
