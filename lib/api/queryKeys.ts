import type { GetProductsParams } from "./products";

export const storefrontQueryKeys = {
  products: {
    all: ["storefront", "products"] as const,
    lists: () => [...storefrontQueryKeys.products.all, "list"] as const,
    list: (params?: GetProductsParams) =>
      [...storefrontQueryKeys.products.lists(), params ?? {}] as const,
    details: () => [...storefrontQueryKeys.products.all, "detail"] as const,
    detail: (slug: string) =>
      [...storefrontQueryKeys.products.details(), slug] as const,
  },
  categories: {
    all: ["storefront", "categories"] as const,
    lists: () => [...storefrontQueryKeys.categories.all, "list"] as const,
    list: () => [...storefrontQueryKeys.categories.lists()] as const,
    details: () => [...storefrontQueryKeys.categories.all, "detail"] as const,
    detail: (slug: string) =>
      [...storefrontQueryKeys.categories.details(), slug] as const,
  },
  catalogs: {
    all: ["storefront", "catalogs"] as const,
    nav: () => [...storefrontQueryKeys.catalogs.all, "nav"] as const,
    details: () => [...storefrontQueryKeys.catalogs.all, "detail"] as const,
    detail: (slug: string, page = 1) =>
      [...storefrontQueryKeys.catalogs.details(), slug, page] as const,
  },
};
