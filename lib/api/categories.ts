import { apiGet } from "./client";
import { normalizeCategory } from "../storefront/normalizers/category";
import type { CategoryApiResponse } from "../storefront/types/api";
import type { CategoryViewModel } from "../storefront/types/viewModels";

type CategoryListPayload =
  | CategoryApiResponse[]
  | {
      items?: CategoryApiResponse[];
      categories?: CategoryApiResponse[];
      data?: CategoryApiResponse[];
    };

function readCategories(payload: CategoryListPayload) {
  if (Array.isArray(payload)) return payload;

  return payload.items ?? payload.categories ?? payload.data ?? [];
}

export async function getCategories(): Promise<CategoryViewModel[]> {
  const result = await apiGet<CategoryListPayload>("/categories");
  return readCategories(result.data).map(normalizeCategory);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryViewModel> {
  const result = await apiGet<CategoryApiResponse>(
    `/categories/slug/${encodeURIComponent(slug)}`,
  );

  return normalizeCategory(result.data);
}
