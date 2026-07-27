type CatalogUrlParams = {
  q?: string | null;
  categoryId?: string | null;
  tag?: string | null;
  page?: number | string | null;
};

function appendParam(searchParams: URLSearchParams, key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return;

  const normalized =
    typeof value === "string" ? value.trim() : String(value).trim();
  if (!normalized) return;

  searchParams.set(key, normalized);
}

export function buildProductListingHref(
  params: CatalogUrlParams,
  pathname = "/new-arrivals",
) {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, "q", params.q);
  appendParam(searchParams, "categoryId", params.categoryId);
  appendParam(searchParams, "tag", params.tag);
  appendParam(searchParams, "page", params.page);

  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/** Product tags are stored lowercase, so menu links use these keys as-is. */
const TAG_LABELS: Record<string, string> = {
  wedding: "Wedding Wear",
  summer: "Summer Wear",
  latest: "Latest Collection",
  featured: "Best Collection",
};

export function formatTagLabel(tag: string) {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return "";

  return (
    TAG_LABELS[normalized] ??
    normalized.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
