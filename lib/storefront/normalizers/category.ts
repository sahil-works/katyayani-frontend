import {
  CATEGORY_IMAGE_FALLBACK,
  resolveImageFallback,
  resolveSeoFallback,
} from "../commerce";
import type { CategoryApiResponse, ProductImageApiResponse } from "../types/api";
import type { CategoryViewModel } from "../types/viewModels";

function readCategoryImage(
  image: CategoryApiResponse["image"],
): ProductImageApiResponse {
  if (typeof image === "string") {
    return { url: image };
  }

  return image ?? {};
}

export function normalizeCategory(
  category: CategoryApiResponse,
): CategoryViewModel {
  const title = category.title?.trim() || category.name?.trim() || category.slug;
  const image = readCategoryImage(category.image);

  return {
    id: category.id,
    title,
    slug: category.slug,
    href: `/collections/${category.slug}`,
    description: category.description?.trim() ?? "",
    image: resolveImageFallback({
      src: image.url ?? image.src,
      alt: image.alt,
      fallbackSrc: CATEGORY_IMAGE_FALLBACK,
      fallbackAlt: title,
    }),
    productCount:
      typeof category.productCount === "number"
        ? category.productCount
        : undefined,
    seo: resolveSeoFallback({
      title: category.seo?.metaTitle,
      description: category.seo?.metaDescription ?? category.description,
      fallbackTitle: `${title} | Katyayani Designer Hub`,
    }),
  };
}
