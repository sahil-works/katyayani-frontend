"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Slider from "react-slick";
import { productsQueryOptions } from "../lib/api";
import type { ProductCardViewModel } from "../lib/storefront/types/viewModels";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "./storefront/AsyncStates";
import { StorefrontImage } from "./storefront/StorefrontImage";

function BestCollectionCard({ product }: { product: ProductCardViewModel }) {
  const priceLabel =
    product.price.minEffectivePrice !== product.price.maxEffectivePrice
      ? product.price.formattedPriceRange
      : product.price.formattedEffectivePrice;

  return (
    <article className="mx-2 flex overflow-hidden rounded-[20px] border border-[#e5e5de] bg-white">
      <div className="flex w-[50%] items-center px-6 py-6 sm:px-7">
        <div>
          {product.category ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a8a8a]">
              {product.category.title}
            </p>
          ) : null}
          <Link href={product.href} className="block">
            <h3 className="max-w-[220px] text-[24px] leading-[1.35] font-medium text-[#111] sm:text-[24px] sm:leading-[1.16]">
              {product.title}
            </h3>
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3 leading-none">
            <span className="text-[21px] font-medium text-[#9ea600] sm:text-[21px]">
              {priceLabel}
            </span>
            {product.price.hasSale ? (
              <span className="text-[18px] text-[#737373] line-through sm:text-[18px]">
                {product.price.formattedPrice}
              </span>
            ) : null}
          </div>
          <p
            className={`mt-3 text-[13px] font-medium ${
              product.inStock ? "text-[#5f6a00]" : "text-[#9a3f3f]"
            }`}
          >
            {product.stockLabel}
          </p>
          <Link
            href={product.href}
            className="mt-8 inline-flex min-w-[118px] justify-center bg-[#9ea600] px-5 py-2 text-[19px] font-medium text-white"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <Link href={product.href} className="relative block min-h-[350px] w-[50%] bg-[#f7f7f5]">
        <StorefrontImage
          image={product.image}
          fill
          className="object-cover object-center"
          sizes="(min-width: 1024px) 360px, 100vw"
        />
      </Link>
    </article>
  );
}

export default function BestCollectionSection() {
  const productsQuery = useQuery(
    productsQueryOptions({ limit: 6, tag: "featured" }),
  );
  const products = productsQuery.data?.items ?? [];
  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: products.length > 2,
    speed: 450,
    slidesToShow: Math.min(2, Math.max(1, products.length)),
    slidesToScroll: 2,
    autoplay: products.length > 2,
    autoplaySpeed: 2500,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    customPaging: () => (
      <span className="block h-3 w-3 rounded-full bg-[#d8dcc0] transition-colors" />
    ),
    appendDots: (dots: React.ReactNode) => (
      <ul className="best-collection-dots">{dots}</ul>
    ),
  };

  return (
    <section className="bg-[#eeeee8] py-16">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-[43px] leading-none font-medium text-[#111] sm:text-[43px]">
            Katyayani&apos;s Best Collection
          </h2>
          <p className="mt-3 text-[19px] leading-[1.35] text-[#5e5e5e]">
            Be the first to explore our brand-new arrivals, crafted just for
            you.
          </p>
        </div>

        <div className="best-collection-slider mt-9">
          {productsQuery.isLoading ? (
            <StorefrontSkeleton rows={4} label="Loading featured products" />
          ) : productsQuery.isError ? (
            <StorefrontErrorState
              error={productsQuery.error}
              title="Could not load featured products"
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
              title="No featured products found"
              description="Featured catalog products will appear here once they are tagged."
            />
          ) : (
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <BestCollectionCard key={product.id} product={product} />
              ))}
            </Slider>
          )}
        </div>
      </div>
    </section>
  );
}
