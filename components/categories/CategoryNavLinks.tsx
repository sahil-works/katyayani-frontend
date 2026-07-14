"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { categoriesQueryOptions } from "../../lib/api";
import { buildProductListingHref } from "../../lib/storefront";

type CategoryNavLinksProps = {
  linkClassName?: string;
  emptyClassName?: string;
  limit?: number;
};

export function CategoryNavLinks({
  linkClassName = "transition-colors hover:text-[#c4ca38]",
  emptyClassName = "text-[16px] text-[#666]",
  limit,
}: CategoryNavLinksProps) {
  const categoriesQuery = useQuery(categoriesQueryOptions());
  const categories = categoriesQuery.data ?? [];
  const visibleCategories =
    typeof limit === "number" ? categories.slice(0, limit) : categories;

  if (categoriesQuery.isLoading) {
    return <li className={emptyClassName}>Loading categories…</li>;
  }

  if (categories.length === 0) {
    return <li className={emptyClassName}>No categories available</li>;
  }

  return (
    <>
      {visibleCategories.map((category) => (
        <li key={category.id}>
          <Link
            href={buildProductListingHref({ categoryId: category.id })}
            className={linkClassName}
          >
            {category.title}
          </Link>
        </li>
      ))}
    </>
  );
}

type CategoryMenuLinksProps = {
  itemClassName?: string;
};

export function CategoryMenuLinks({
  itemClassName = "group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[16px] text-[#343434] transition-colors hover:bg-[#f7f8ec] hover:text-[#9ea600]",
}: CategoryMenuLinksProps) {
  const categoriesQuery = useQuery(categoriesQueryOptions());
  const categories = categoriesQuery.data ?? [];

  if (categoriesQuery.isLoading) {
    return (
      <p className="px-3 py-2 text-[14px] text-[#888]">Loading categories…</p>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="px-3 py-2 text-[14px] text-[#888]">No categories yet</p>
    );
  }

  return (
    <>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={buildProductListingHref({ categoryId: category.id })}
          className={itemClassName}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#9ea600]"
          />
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover/link:after:scale-x-100">
            {category.title}
          </span>
        </Link>
      ))}
    </>
  );
}
