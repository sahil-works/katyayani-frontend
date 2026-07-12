import { queryOptions } from "@tanstack/react-query";
import {
  getProductBySlug,
  getProducts,
  serializeProductQuery,
  type GetProductsParams,
} from "./products";
import { getCategories, getCategoryBySlug } from "./categories";
import { getCatalogBySlug, getCatalogNavItems, type GetCatalogBySlugParams } from "./catalogs";
import { storefrontQueryKeys } from "./queryKeys";

export function productsQueryOptions(params?: GetProductsParams) {
  const queryKeyParams = serializeProductQuery(params);

  return queryOptions({
    queryKey: storefrontQueryKeys.products.list(queryKeyParams),
    queryFn: () => getProducts(params),
  });
}

export function productDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: storefrontQueryKeys.products.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: storefrontQueryKeys.categories.list(),
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function categoryDetailQueryOptions(slug: string) {
  return queryOptions({
    queryKey: storefrontQueryKeys.categories.detail(slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function catalogNavQueryOptions() {
  return queryOptions({
    queryKey: storefrontQueryKeys.catalogs.nav(),
    queryFn: getCatalogNavItems,
    staleTime: 5 * 60 * 1000,
  });
}

export function catalogDetailQueryOptions(params: GetCatalogBySlugParams) {
  const page = params.page ?? 1;

  return queryOptions({
    queryKey: storefrontQueryKeys.catalogs.detail(params.slug, page),
    queryFn: () => getCatalogBySlug({ ...params, page }),
    enabled: Boolean(params.slug),
    staleTime: 60 * 1000,
  });
}
