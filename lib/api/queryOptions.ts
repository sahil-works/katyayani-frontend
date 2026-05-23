import { queryOptions } from "@tanstack/react-query";
import {
  getProductBySlug,
  getProducts,
  serializeProductQuery,
  type GetProductsParams,
} from "./products";
import { getCategories, getCategoryBySlug } from "./categories";
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
