import { apiGet } from "./client";
import type { PaginatedResult, PaginationMeta, QueryParams } from "./types";
import { normalizeProductCard, normalizeProductDetail } from "../storefront/normalizers/product";
import type { ProductApiResponse } from "../storefront/types/api";
import type {
  ProductCardViewModel,
  ProductDetailViewModel,
} from "../storefront/types/viewModels";

const DEFAULT_PRODUCT_LIMIT = 12;
const MAX_PRODUCT_LIMIT = 60;

export type ProductSort = "newest" | "price_low" | "price_high";

export type GetProductsParams = {
  page?: number;
  skip?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  tag?: string;
  sort?: ProductSort;
};

export type SerializedProductQuery = {
  skip: number;
  limit: number;
  q?: string;
  categoryId?: string;
  tag?: string;
  sort?: ProductSort;
};

type ProductListPayload =
  | ProductApiResponse[]
  | {
      items?: ProductApiResponse[];
      products?: ProductApiResponse[];
      data?: ProductApiResponse[];
      pagination?: Partial<PaginationMeta>;
      total?: number | string | null;
      skip?: number | string | null;
      limit?: number | string | null;
      hasMore?: boolean | null;
    };

function clampInteger(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function cleanString(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function serializeProductQuery(
  params: GetProductsParams = {},
): SerializedProductQuery {
  const limit = clampInteger(
    params.limit,
    DEFAULT_PRODUCT_LIMIT,
    1,
    MAX_PRODUCT_LIMIT,
  );
  const page = clampInteger(params.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const skip =
    typeof params.skip === "number" && Number.isFinite(params.skip)
      ? Math.max(0, Math.floor(params.skip))
      : (page - 1) * limit;

  return {
    skip,
    limit,
    q: cleanString(params.q),
    categoryId: cleanString(params.categoryId),
    tag: cleanString(params.tag),
    sort: params.sort,
  };
}

export function toProductApiQuery(
  params: GetProductsParams = {},
): QueryParams {
  const query = serializeProductQuery(params);

  return {
    skip: query.skip,
    limit: query.limit,
    categoryId: query.categoryId,
    tag: query.tag,
    q: query.q,
    sort: query.sort,
  };
}

function defaultPagination(
  count: number,
  query: SerializedProductQuery,
): PaginationMeta {
  const limit = query.limit || count;
  const page = limit > 0 ? Math.floor(query.skip / limit) + 1 : 1;
  const total = count;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    page,
    skip: query.skip,
    limit,
    total,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: query.skip > 0,
  };
}

function readProducts(payload: ProductListPayload) {
  if (Array.isArray(payload)) return payload;

  return payload.items ?? payload.products ?? payload.data ?? [];
}

function readPagination(
  payload: ProductListPayload,
  query: SerializedProductQuery,
  fallback?: PaginationMeta,
): PaginationMeta | undefined {
  if (Array.isArray(payload)) return fallback;

  const responseSkip = readNumber(payload.skip) ?? query.skip;
  const responseLimit = readNumber(payload.limit) ?? query.limit;
  const responseTotal = readNumber(payload.total) ?? fallback?.total ?? 0;
  const page =
    responseLimit > 0
      ? Math.floor(responseSkip / responseLimit) + 1
      : fallback?.page ?? 1;
  const totalPages =
    responseLimit > 0
      ? Math.ceil(responseTotal / responseLimit)
      : fallback?.totalPages ?? 0;
  const hasMore =
    typeof payload.hasMore === "boolean"
      ? payload.hasMore
      : totalPages > 0 && page < totalPages;
  const normalized: PaginationMeta = {
    page,
    skip: responseSkip,
    limit: responseLimit,
    total: responseTotal,
    totalPages,
    hasMore,
    hasNextPage: hasMore,
    hasPreviousPage: responseSkip > 0,
  };

  return payload.pagination ? { ...normalized, ...payload.pagination } : normalized;
}

export async function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedResult<ProductCardViewModel>> {
  const query = serializeProductQuery(params);
  const result = await apiGet<ProductListPayload>(
    "/products",
    toProductApiQuery(params),
  );
  const products = readProducts(result.data);
  const fallback = defaultPagination(products.length, query);

  return {
    items: products.map(normalizeProductCard),
    pagination:
      result.pagination ??
      readPagination(result.data, query, fallback) ??
      fallback,
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailViewModel> {
  const result = await apiGet<ProductApiResponse>(
    `/products/slug/${encodeURIComponent(slug)}`,
  );

  return normalizeProductDetail(result.data);
}
