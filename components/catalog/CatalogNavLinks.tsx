"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { catalogNavQueryOptions } from "../../lib/api";
import { buildCatalogHref } from "../../lib/api/catalogs";

type CatalogNavLinksProps = {
  linkClassName?: string;
  emptyClassName?: string;
};

export function CatalogNavLinks({
  linkClassName = "transition-colors hover:text-[#c4ca38]",
  emptyClassName = "text-[16px] text-[#666]",
}: CatalogNavLinksProps) {
  const catalogsQuery = useQuery(catalogNavQueryOptions());
  const catalogs = catalogsQuery.data ?? [];

  if (catalogsQuery.isLoading) {
    return <li className={emptyClassName}>Loading catalogs…</li>;
  }

  if (catalogs.length === 0) {
    return <li className={emptyClassName}>No catalogs available</li>;
  }

  return (
    <>
      {catalogs.map((catalog) => (
        <li key={catalog.id}>
          <Link href={buildCatalogHref(catalog.slug)} className={linkClassName}>
            {catalog.name}
          </Link>
        </li>
      ))}
    </>
  );
}

type CatalogMenuLinksProps = {
  itemClassName?: string;
};

export function CatalogMenuLinks({
  itemClassName = "group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[16px] text-[#343434] transition-colors hover:bg-[#f7f8ec] hover:text-[#9ea600]",
}: CatalogMenuLinksProps) {
  const catalogsQuery = useQuery(catalogNavQueryOptions());
  const catalogs = catalogsQuery.data ?? [];

  if (catalogsQuery.isLoading) {
    return (
      <p className="px-3 py-2 text-[14px] text-[#888]">Loading catalogs…</p>
    );
  }

  if (catalogs.length === 0) {
    return (
      <p className="px-3 py-2 text-[14px] text-[#888]">No catalogs yet</p>
    );
  }

  return (
    <>
      {catalogs.map((catalog) => (
        <Link
          key={catalog.id}
          href={buildCatalogHref(catalog.slug)}
          className={itemClassName}
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-[#9ea600]"
          />
          <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover/link:after:scale-x-100">
            {catalog.name}
          </span>
        </Link>
      ))}
    </>
  );
}
