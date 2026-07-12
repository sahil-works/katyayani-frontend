import { apiGet } from "./client";
import { normalizeProductCard } from "../storefront/normalizers/product";
import type { ProductApiResponse } from "../storefront/types/api";
import type {
  PaginatedResult,
  PaginationMeta,
} from "./types";
import type { ProductCardViewModel } from "../storefront/types/viewModels";

export type CatalogNavItem = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogViewModel = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
};

type CatalogNavPayload =
  | CatalogNavItem[]
  | {
      items?: CatalogNavItem[];
      catalogs?: CatalogNavItem[];
      data?: CatalogNavItem[];
    };

type CatalogDetailPayload = {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  productCount?: number;
  products?: {
    items?: ProductApiResponse[];
    total?: number | string | null;
    skip?: number | string | null;
    limit?: number | string | null;
    hasMore?: boolean | null;
  };
};

function readList<T>(payload: T[] | { items?: T[]; data?: T[]; catalogs?: T[] }) {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.catalogs ?? payload.data ?? [];
}

function normalizeCatalogNav(raw: CatalogNavItem): CatalogNavItem {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
  };
}

function normalizeCatalog(raw: CatalogDetailPayload): CatalogViewModel {
  return {
    id: String(raw.id ?? raw._id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    description: String(raw.description ?? ""),
    image: String(raw.image ?? ""),
    productCount: Number(raw.productCount ?? 0),
  };
}

function readNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizePagination(
  products: NonNullable<CatalogDetailPayload["products"]>,
  fallbackCount: number,
): PaginationMeta {
  const limit = readNumber(products.limit) ?? fallbackCount;
  const skip = readNumber(products.skip) ?? 0;
  const total = readNumber(products.total) ?? fallbackCount;
  const page = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    page,
    skip,
    limit,
    total,
    totalPages,
    hasNextPage: products.hasMore ?? skip + fallbackCount < total,
    hasPreviousPage: page > 1,
  };
}

export async function getCatalogNavItems(): Promise<CatalogNavItem[]> {
  const result = await apiGet<CatalogNavPayload>("/catalogs");
  return readList(result.data).map(normalizeCatalogNav);
}

export type GetCatalogBySlugParams = {
  slug: string;
  page?: number;
  limit?: number;
};

export type CatalogDetailResult = {
  catalog: CatalogViewModel;
  products: PaginatedResult<ProductCardViewModel>;
};

export async function getCatalogBySlug(
  params: GetCatalogBySlugParams,
): Promise<CatalogDetailResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(60, Math.max(1, params.limit ?? 12));
  const skip = (page - 1) * limit;

  const result = await apiGet<CatalogDetailPayload>(
    `/catalogs/slug/${encodeURIComponent(params.slug)}`,
    { skip, limit },
  );

  const catalog = normalizeCatalog(result.data);
  const items = (result.data.products?.items ?? []).map(normalizeProductCard);
  const pagination = normalizePagination(result.data.products ?? {}, items.length);

  return {
    catalog,
    products: { items, pagination },
  };
}

export function buildCatalogHref(slug: string) {
  return `/catalog/${encodeURIComponent(slug)}`;
}
