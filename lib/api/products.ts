import { apiGet } from "./client";
import type { PaginatedResult, PaginationMeta } from "./types";
import { normalizeProductCard, normalizeProductDetail } from "../storefront/normalizers/product";
import type { ProductApiResponse } from "../storefront/types/api";
import type {
  ProductCardViewModel,
  ProductDetailViewModel,
} from "../storefront/types/viewModels";

export type GetProductsParams = {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  tag?: string;
};

type ProductListPayload =
  | ProductApiResponse[]
  | {
      items?: ProductApiResponse[];
      products?: ProductApiResponse[];
      data?: ProductApiResponse[];
      pagination?: Partial<PaginationMeta>;
    };

function defaultPagination(
  count: number,
  params?: GetProductsParams,
): PaginationMeta {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? count;
  const totalPages = limit > 0 ? Math.ceil(count / limit) : 0;

  return {
    page,
    limit,
    total: count,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function readProducts(payload: ProductListPayload) {
  if (Array.isArray(payload)) return payload;

  return payload.items ?? payload.products ?? payload.data ?? [];
}

function readPagination(
  payload: ProductListPayload,
  fallback?: PaginationMeta,
) {
  if (Array.isArray(payload)) return fallback;

  return payload.pagination ? { ...fallback, ...payload.pagination } : fallback;
}

export async function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedResult<ProductCardViewModel>> {
  const result = await apiGet<ProductListPayload>("/products", params);
  const products = readProducts(result.data);
  const fallback = defaultPagination(products.length, params);

  return {
    items: products.map(normalizeProductCard),
    pagination:
      result.pagination ??
      (readPagination(result.data, fallback) as PaginationMeta) ??
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
