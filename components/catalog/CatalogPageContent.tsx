"use client";

import { useQuery } from "@tanstack/react-query";
import { Dancing_Script } from "next/font/google";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { catalogDetailQueryOptions } from "../../lib/api";
import { buildCatalogHref } from "../../lib/api/catalogs";
import { ProductCard } from "../storefront/ProductCard";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "../storefront/AsyncStates";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const PAGE_SIZE = 12;

function readPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

type CatalogPageContentProps = {
  slug: string;
};

export default function CatalogPageContent({ slug }: CatalogPageContentProps) {
  const searchParams = useSearchParams();
  const page = readPositiveInteger(searchParams.get("page"), 1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const catalogQuery = useQuery(
    catalogDetailQueryOptions({ slug, page, limit: PAGE_SIZE }),
  );

  const catalog = catalogQuery.data?.catalog;
  const products = catalogQuery.data?.products.items ?? [];
  const pagination = catalogQuery.data?.products.pagination;

  const pageHref = useMemo(() => {
    return (nextPage: number) => {
      const params = new URLSearchParams();
      if (nextPage > 1) params.set("page", String(nextPage));
      const search = params.toString();
      return search ? `${buildCatalogHref(slug)}?${search}` : buildCatalogHref(slug);
    };
  }, [slug]);

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#fafaf8]">
      <section className="relative overflow-hidden border-b border-[#ecece6] bg-[#eeeee9]">
        {catalog?.image ? (
          <div className="absolute inset-0">
            <img
              src={catalog.image}
              alt={catalog.name}
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#eeeee9] via-[#eeeee9]/92 to-[#eeeee9]/75" />
          </div>
        ) : null}

        <div className="relative mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-16">
          <div className="text-[14px] text-[#5c5c5c]">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span className="mx-2 text-[#9c9c9c]">/</span>
            <span>Catalog</span>
            {catalog?.name ? (
              <>
                <span className="mx-2 text-[#9c9c9c]">/</span>
                <span>{catalog.name}</span>
              </>
            ) : null}
          </div>

          <p
            className={`${dancingScript.className} mt-8 text-[28px] leading-none text-[#ea206d] lg:text-[34px]`}
          >
            Curated Collection
          </p>
          <h1 className="mt-4 max-w-[760px] text-[42px] leading-[1.05] font-medium tracking-[0.01em] text-[#111] lg:text-[56px]">
            {catalog?.name ?? "Catalog"}
          </h1>
          {catalog?.description ? (
            <p className="mt-5 max-w-[680px] text-[18px] leading-[1.6] text-[#555]">
              {catalog.description}
            </p>
          ) : null}
          <p className="mt-6 inline-flex rounded-full bg-white/80 px-4 py-2 text-[14px] font-medium text-[#666] ring-1 ring-[#e5e5df]">
            {pagination?.total ?? catalog?.productCount ?? 0} products in this catalog
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-16">
        {catalogQuery.isLoading ? (
          <StorefrontSkeleton rows={8} label="Loading catalog products" />
        ) : catalogQuery.isError ? (
          <StorefrontErrorState
            error={catalogQuery.error}
            title="Could not load this catalog"
            action={
              <button
                type="button"
                onClick={() => catalogQuery.refetch()}
                className="text-[14px] font-semibold text-[#8a2f2f] underline"
              >
                Retry
              </button>
            }
          />
        ) : products.length === 0 ? (
          <StorefrontEmptyState
            title="No products in this catalog yet"
            description="Check back soon — new pieces are added regularly."
          />
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[18px] text-[#555]">
                Showing {products.length} of {pagination?.total ?? products.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`inline-flex h-[34px] w-[34px] items-center justify-center border transition-colors ${
                    viewMode === "grid"
                      ? "border-[#d8d8d8] bg-[#f3f3f3] text-[#222]"
                      : "border-[#ebebeb] bg-transparent text-[#8b8b8b]"
                  }`}
                >
                  ▦
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`inline-flex h-[34px] w-[34px] items-center justify-center border transition-colors ${
                    viewMode === "list"
                      ? "border-[#d8d8d8] bg-[#f3f3f3] text-[#222]"
                      : "border-[#ebebeb] bg-transparent text-[#8b8b8b]"
                  }`}
                >
                  ☰
                </button>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid grid-cols-1 gap-6 md:grid-cols-2"
              }
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  imagePriority={index < 3}
                  animationDelay={(index % 3) * 100}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-12 flex items-center justify-center gap-3">
                <Link
                  href={pageHref(Math.max(1, page - 1))}
                  aria-disabled={!pagination.hasPreviousPage}
                  className={`h-11 rounded-full border border-[#d8d8d8] px-5 text-[14px] font-semibold leading-[2.5rem] text-[#333] ${
                    pagination.hasPreviousPage
                      ? "hover:bg-white"
                      : "pointer-events-none opacity-40"
                  }`}
                >
                  Previous
                </Link>
                <span className="text-[14px] text-[#666]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Link
                  href={pageHref(page + 1)}
                  aria-disabled={!pagination.hasNextPage}
                  className={`h-11 rounded-full border border-[#d8d8d8] px-5 text-[14px] font-semibold leading-[2.5rem] text-[#333] ${
                    pagination.hasNextPage
                      ? "hover:bg-white"
                      : "pointer-events-none opacity-40"
                  }`}
                >
                  Next
                </Link>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
