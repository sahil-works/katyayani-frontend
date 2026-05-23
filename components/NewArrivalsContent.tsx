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
  const [qDraft, setQDraft] = useState(searchParams.get("q") ?? "");
  const [tagDraft, setTagDraft] = useState(searchParams.get("tag") ?? "");

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
  const heading = selectedCategory?.title ?? tag ?? q ?? "New Arrivals";
  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;

  function updateFilters(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ q: qDraft.trim() || undefined });
  }

  function handleTagSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ tag: tagDraft.trim() || undefined });
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-white">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 pb-18 lg:px-10">
        <div className="text-[14px] text-[#5c5c5c]">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          <span className="tracking-[0.03em] uppercase">{heading}</span>
        </div>

        <h1 className="mt-14 text-center text-[38px] leading-none font-medium tracking-[0.02em] text-[#222]">
          {heading.toUpperCase()}
        </h1>

        <section className="mt-16 grid gap-10 lg:grid-cols-[300px_1fr]">
          <aside className="sticky top-5 self-start rounded-xl border border-[#ececec] bg-[#fcfcfc] p-6 lg:p-7">
            <h2 className="text-[24px] leading-none font-medium text-[#2d2d2d]">
              Filter
            </h2>

            <form onSubmit={handleSearchSubmit} className="mt-7">
              <label
                htmlFor="catalog-q"
                className="mb-2 block text-[14px] font-medium text-[#555]"
              >
                Search products
              </label>
              <div className="flex overflow-hidden rounded-lg border border-[#dedede] bg-white">
                <input
                  id="catalog-q"
                  value={qDraft}
                  onChange={(event) => setQDraft(event.target.value)}
                  placeholder="Search..."
                  className="min-w-0 flex-1 px-3 py-2.5 text-[15px] outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search catalog"
                  className="grid w-11 place-items-center bg-[#9ea600] text-white"
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
                  className="h-11 w-full rounded-md border border-[#d9d9d9] bg-white px-3 text-[15px] outline-none focus:border-[#9ea600] focus:ring-2 focus:ring-[#9ea600]/20"
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
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  placeholder="e.g. new-arrivals"
                  className="h-11 min-w-0 flex-1 px-3 text-[15px] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#2f2f2f] px-3 text-[13px] font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </form>

            {(q || categoryId || tag) ? (
              <button
                type="button"
                onClick={() => {
                  setQDraft("");
                  setTagDraft("");
                  router.replace(pathname, { scroll: false });
                }}
                className="mt-6 text-[14px] font-medium text-[#6f7600] underline underline-offset-2"
              >
                Clear filters
              </button>
            ) : null}
          </aside>

          <div>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
                  <LayoutGrid className="h-[17px] w-[17px]" />
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
                  <List className="h-[17px] w-[17px]" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-7 text-[18px] text-[#5a5a5a]">
                <div className="flex items-center gap-2">
                  <span>Source:</span>
                  <div className="relative">
                    <span className="inline-flex h-11 min-w-[170px] items-center rounded-md border border-[#d9d9d9] bg-white pl-4 pr-10 text-[16px] text-[#2f2f2f]">
                      Backend catalog
                    </span>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-[16px] w-[16px] -translate-y-1/2 text-[#747474]" />
                  </div>
                </div>
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
                description="Try a different search, category, or tag."
              />
            ) : (
              <>
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
