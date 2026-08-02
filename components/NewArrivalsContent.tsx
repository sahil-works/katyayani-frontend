"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, LayoutGrid, List, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  categoriesQueryOptions,
  productsQueryOptions,
  type GetProductsParams,
} from "../lib/api";
import { buildProductListingHref, formatTagLabel } from "../lib/storefront";
import AnimateOnView from "./AnimateOnView";
import { ProductCard } from "./storefront/ProductCard";
import {
  StorefrontEmptyState,
  StorefrontErrorState,
  StorefrontSkeleton,
} from "./storefront/AsyncStates";

const PAGE_SIZE = 12;

function readPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanParam(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function NewArrivalsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = cleanParam(searchParams.get("q"));
  const categoryId = cleanParam(searchParams.get("categoryId"));
  const tag = cleanParam(searchParams.get("tag"));
  const page = readPositiveInteger(searchParams.get("page"), 1);

  const productParams = useMemo<GetProductsParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      q,
      categoryId,
      tag,
    }),
    [categoryId, page, q, tag],
  );

  const productsQuery = useQuery(productsQueryOptions(productParams));
  const categoriesQuery = useQuery(categoriesQueryOptions());

  const selectedCategory = categoriesQuery.data?.find(
    (category) => category.id === categoryId,
  );
  const tagLabel = tag ? formatTagLabel(tag) : undefined;
  const heading = selectedCategory?.title ?? tagLabel ?? q ?? "New Arrivals";
  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;

  function updateFilters(
    updates: Partial<Pick<GetProductsParams, "q" | "categoryId" | "tag">>,
  ) {
    router.replace(
      buildProductListingHref({ q, categoryId, tag, ...updates }, pathname),
      { scroll: false },
    );
  }

  function goToPage(nextPage: number) {
    router.replace(
      buildProductListingHref({ q, categoryId, tag, page: nextPage }, pathname),
      { scroll: true },
    );
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateFilters({ q: String(formData.get("q") ?? "").trim() || undefined });
  }

  function handleTagSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateFilters({ tag: String(formData.get("tag") ?? "").trim() || undefined });
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-white">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 lg:px-10">
        <div className="text-[14px] text-[#5c5c5c]">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          {categoryId && selectedCategory ? (
            <>
              <Link href="/new-arrivals" className="hover:text-black">
                New Arrivals
              </Link>
              <span className="mx-2 text-[#9c9c9c]">/</span>
              <span className="tracking-[0.03em] uppercase">{selectedCategory.title}</span>
            </>
          ) : (
            <span className="tracking-[0.03em] uppercase">{heading}</span>
          )}
        </div>
      </div>

      <section
        className="mt-6 w-full border-y border-[#f3d6e3] bg-[#fdf2f7]"
        aria-labelledby="catalog-heading"
      >
        <div className="mx-auto max-w-[1320px] px-6 py-10 sm:py-12 lg:px-10 lg:py-14">
          <AnimateOnView animation="fadeInDown" duration={0.75}>
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.22em] text-[#ea206d]">
              {selectedCategory
                ? "Shop by category"
                : tagLabel
                  ? "Shop by collection"
                  : "Browse collection"}
            </p>
            <h1
              id="catalog-heading"
              className="mt-3 text-center text-[26px] leading-tight font-medium tracking-[0.02em] text-[#222] sm:text-[34px] sm:leading-none lg:text-[38px]"
            >
              {heading.toUpperCase()}
            </h1>
            {selectedCategory?.description ? (
              <p className="mx-auto mt-4 max-w-[640px] text-center text-[16px] leading-normal text-[#6b5560]">
                {selectedCategory.description}
              </p>
            ) : null}
          </AnimateOnView>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 sm:pt-12 lg:px-10">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="relative z-10 w-full min-w-0 self-start rounded-xl border border-[#ececec] bg-[#fcfcfc] lg:sticky lg:top-36 lg:z-10 lg:p-7">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 lg:px-0 lg:py-0">
              <h2 className="text-[20px] leading-none font-medium text-[#2d2d2d] sm:text-[24px]">
                Filter
                {(q || categoryId || tag) ? (
                  <span className="ml-2 align-middle text-[12px] font-semibold tracking-wide text-[#ea206d] uppercase">
                    Active
                  </span>
                ) : null}
              </h2>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 text-[13px] font-medium text-[#444] lg:hidden"
                aria-expanded={filtersOpen}
                aria-controls="catalog-filters"
                onClick={() => setFiltersOpen((prev) => !prev)}
              >
                {filtersOpen ? "Hide" : "Show"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div
              id="catalog-filters"
              className={`${filtersOpen ? "block" : "hidden"} border-t border-[#ececec] px-4 pt-5 pb-5 sm:px-5 lg:block lg:border-t-0 lg:px-0 lg:pt-7 lg:pb-0`}
            >
              <form onSubmit={handleSearchSubmit}>
                <label
                  htmlFor="catalog-q"
                  className="mb-2 block text-[14px] font-medium text-[#555]"
                >
                  Search by name or SKU
                </label>
                <div className="flex overflow-hidden rounded-lg border border-[#dedede] bg-white">
                  <input
                    id="catalog-q"
                    key={`q-${q ?? ""}`}
                    name="q"
                    defaultValue={q ?? ""}
                    placeholder="Search name or SKU..."
                    className="min-w-0 flex-1 px-3 py-2.5 text-[15px] outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Search catalog"
                    className="grid w-11 shrink-0 place-items-center bg-[#ea206d] text-white"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-7 border-t border-[#ececec] pt-6">
                <label
                  htmlFor="catalog-category"
                  className="mb-2 block text-[18px] leading-none font-medium text-[#242424]"
                >
                  Category
                </label>
                {categoriesQuery.isLoading ? (
                  <StorefrontSkeleton rows={3} label="Loading categories" />
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
                ) : (
                  <select
                    id="catalog-category"
                    value={categoryId ?? ""}
                    onChange={(event) =>
                      updateFilters({
                        categoryId: event.target.value || undefined,
                      })
                    }
                    className="h-11 w-full rounded-md border border-[#d9d9d9] bg-white px-3 text-[15px] outline-none focus:border-[#ea206d] focus:ring-2 focus:ring-[#ea206d]/20"
                  >
                    <option value="">All categories</option>
                    {categoriesQuery.data?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <form
                onSubmit={handleTagSubmit}
                className="mt-7 border-t border-[#ececec] pt-6"
              >
                <label
                  htmlFor="catalog-tag"
                  className="mb-2 block text-[18px] leading-none font-medium text-[#242424]"
                >
                  Tag
                </label>
                <div className="flex overflow-hidden rounded-md border border-[#d9d9d9] bg-white">
                  <input
                    id="catalog-tag"
                    key={`tag-${tag ?? ""}`}
                    name="tag"
                    defaultValue={tag ?? ""}
                    placeholder="e.g. new-arrivals"
                    className="h-11 min-w-0 flex-1 px-3 text-[15px] outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-[#2f2f2f] px-3 text-[13px] font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
              </form>

              {(q || categoryId || tag) ? (
                <button
                  type="button"
                  onClick={() => {
                    router.replace(pathname, { scroll: false });
                  }}
                  className="mt-6 text-[14px] font-medium text-[#6f7600] underline underline-offset-2"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </aside>

          <div className="relative z-0 min-w-0">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8 sm:gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`inline-flex h-10 w-10 items-center justify-center border transition-colors sm:h-[34px] sm:w-[34px] ${
                    viewMode === "grid"
                      ? "border-[#d8d8d8] bg-[#f3f3f3] text-[#222]"
                      : "border-[#ebebeb] bg-transparent text-[#8b8b8b]"
                  }`}
                >
                  <LayoutGrid className="h-[17px] w-[17px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`inline-flex h-10 w-10 items-center justify-center border transition-colors sm:h-[34px] sm:w-[34px] ${
                    viewMode === "list"
                      ? "border-[#d8d8d8] bg-[#f3f3f3] text-[#222]"
                      : "border-[#ebebeb] bg-transparent text-[#8b8b8b]"
                  }`}
                >
                  <List className="h-[17px] w-[17px]" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[15px] text-[#5a5a5a] sm:gap-7 sm:text-[18px]">
                {/* <div className="flex items-center gap-2">
                  <span>Source:</span>
                  <div className="relative">
                    <span className="inline-flex h-11 min-w-[170px] items-center rounded-md border border-[#d9d9d9] bg-white pl-4 pr-10 text-[16px] text-[#2f2f2f]">
                      Backend catalog
                    </span>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-[16px] w-[16px] -translate-y-1/2 text-[#747474]" />
                  </div>
                </div> */}
                <span>{pagination?.total ?? products.length} Products</span>
              </div>
            </div>

            {productsQuery.isLoading ? (
              <StorefrontSkeleton rows={8} label="Loading products" />
            ) : productsQuery.isError ? (
              <StorefrontErrorState
                error={productsQuery.error}
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
                title="No products found"
                description="Try a different product name, SKU, category, or tag."
              />
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-9 xl:grid-cols-3"
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
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() => goToPage(Math.max(1, page - 1))}
                      className="h-11 rounded-full border border-[#d8d8d8] px-5 text-[14px] font-semibold text-[#333] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-[14px] text-[#666]">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={!pagination.hasNextPage}
                      onClick={() => goToPage(page + 1)}
                      className="h-11 rounded-full border border-[#d8d8d8] px-5 text-[14px] font-semibold text-[#333] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
