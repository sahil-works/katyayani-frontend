import {
  coerceNumber,
  formatCurrency,
  getStockLabel,
  PRODUCT_IMAGE_FALLBACK,
  renderPriceRange,
  resolveImageFallback,
  resolveSeoFallback,
} from "../commerce";
import type {
  ProductApiResponse,
  ProductImageApiResponse,
  ProductVariantApiResponse,
} from "../types/api";
import type {
  ProductCardViewModel,
  ProductDetailViewModel,
  ProductPriceViewModel,
  ProductVariantViewModel,
  StorefrontImageViewModel,
} from "../types/viewModels";
import { normalizeCategory } from "./category";

function numberOrUndefined(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;
  const numeric = coerceNumber(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizePrice({
  price,
  salePrice,
  effectivePrice,
  minEffectivePrice,
  maxEffectivePrice,
  hasSale,
}: {
  price: number | string | null | undefined;
  salePrice?: number | string | null;
  effectivePrice?: number | string | null;
  minEffectivePrice?: number | string | null;
  maxEffectivePrice?: number | string | null;
  hasSale?: boolean | null;
}): ProductPriceViewModel {
  const basePrice = numberOrUndefined(price) ?? 0;
  const normalizedSalePrice = numberOrUndefined(salePrice);
  const normalizedEffectivePrice =
    numberOrUndefined(effectivePrice) ?? basePrice;
  const normalizedMinEffectivePrice =
    numberOrUndefined(minEffectivePrice) ?? normalizedEffectivePrice;
  const normalizedMaxEffectivePrice =
    numberOrUndefined(maxEffectivePrice) ?? normalizedEffectivePrice;

  return {
    price: basePrice,
    salePrice: normalizedSalePrice,
    effectivePrice: normalizedEffectivePrice,
    minEffectivePrice: normalizedMinEffectivePrice,
    maxEffectivePrice: normalizedMaxEffectivePrice,
    currency: "INR",
    formattedPrice: formatCurrency(basePrice),
    formattedSalePrice:
      typeof normalizedSalePrice === "number"
        ? formatCurrency(normalizedSalePrice)
        : undefined,
    formattedEffectivePrice: formatCurrency(normalizedEffectivePrice),
    formattedPriceRange: renderPriceRange([
      normalizedMinEffectivePrice,
      normalizedMaxEffectivePrice,
    ]),
    hasSale: Boolean(hasSale),
  };
}

function variantIsInStock(variant: ProductVariantApiResponse) {
  if (variant.isActive === false) return false;
  if (variant.available === false) return false;
  if (typeof variant.inStock === "boolean") return variant.inStock;

  const stockStatus = variant.stockStatus?.toLowerCase();
  if (stockStatus) {
    return ["in_stock", "in-stock", "available", "low_stock"].includes(
      stockStatus,
    );
  }

  const stockQuantity = variant.stockQuantity ?? variant.stock;
  if (typeof stockQuantity === "number") return stockQuantity > 0;

  return true;
}

function normalizeVariant(
  variant: ProductVariantApiResponse,
): ProductVariantViewModel {
  const stockQuantity = variant.stockQuantity ?? variant.stock ?? undefined;
  const inStock = variantIsInStock(variant);
  const images = normalizeVariantImages(variant);

  return {
    id: variant.id,
    sku: variant.sku ?? undefined,
    title: variant.title?.trim() || variant.sku || "Default variant",
    options: variant.options ?? {},
    images,
    price: normalizePrice({
      price: variant.price,
      salePrice: variant.salePrice,
      effectivePrice: variant.effectivePrice,
      hasSale: variant.hasSale,
    }),
    inStock,
    stockLabel: getStockLabel(inStock, stockQuantity),
    stockQuantity,
    isActive: variant.isActive !== false && variant.available !== false,
  };
}

function readVariantImage(
  image: ProductVariantApiResponse["image"],
): ProductImageApiResponse | undefined {
  if (typeof image === "string") {
    return { url: image };
  }

  return image ?? undefined;
}

function normalizeVariantImages(
  variant: ProductVariantApiResponse,
): StorefrontImageViewModel[] {
  const variantImages = [
    readVariantImage(variant.image),
    ...(variant.images ?? []),
  ].filter((image): image is ProductImageApiResponse => Boolean(image));

  return sortImages(variantImages)
    .map((image) =>
      resolveImageFallback({
        src: image.url ?? image.src,
        alt: image.alt,
        fallbackAlt: variant.title ?? variant.sku ?? "Product variant",
      }),
    )
    .filter((image, index, allImages) => {
      return allImages.findIndex((item) => item.src === image.src) === index;
    });
}

function sortImages(images: ProductImageApiResponse[]) {
  return [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

function normalizeImages(product: ProductApiResponse): StorefrontImageViewModel[] {
  const images = sortImages(product.images ?? [])
    .map((image) =>
      resolveImageFallback({
        src: image.url ?? image.src,
        alt: image.alt,
        fallbackAlt: product.title,
      }),
    )
    .filter((image, index, allImages) => {
      return allImages.findIndex((item) => item.src === image.src) === index;
    });

  if (images.length > 0) return images;

  return [
    resolveImageFallback({
      fallbackSrc: PRODUCT_IMAGE_FALLBACK,
      fallbackAlt: product.title,
    }),
  ];
}

function productIsInStock(
  product: ProductApiResponse,
  variants: ProductVariantViewModel[],
) {
  if (product.isActive === false) return false;
  if (product.available === false) return false;
  if (typeof product.inStock === "boolean") return product.inStock;

  const stockStatus = product.stockStatus?.toLowerCase();
  if (stockStatus) {
    return ["in_stock", "in-stock", "available", "low_stock"].includes(
      stockStatus,
    );
  }

  if (variants.length > 0) {
    return variants.some((variant) => variant.inStock);
  }

  return true;
}

function pickPrimaryVariant(variants: ProductVariantViewModel[]) {
  return variants.find((variant) => variant.inStock) ?? variants[0];
}

function resolveProductCategory(product: ProductApiResponse) {
  if (product.category) return normalizeCategory(product.category);
  return product.categories?.[0] ? normalizeCategory(product.categories[0]) : undefined;
}

export function normalizeProductCard(
  product: ProductApiResponse,
): ProductCardViewModel {
  const variants = (product.variants ?? []).map(normalizeVariant);
  const primaryVariant = pickPrimaryVariant(variants);
  const price =
    normalizePrice({
      price: product.price ?? primaryVariant?.price.price,
      salePrice: product.salePrice ?? primaryVariant?.price.salePrice,
      effectivePrice: product.effectivePrice,
      minEffectivePrice: product.minEffectivePrice,
      maxEffectivePrice: product.maxEffectivePrice,
      hasSale: product.hasSale,
    }) ?? primaryVariant?.price;
  const inStock = productIsInStock(product, variants);
  const [image] = normalizeImages(product);

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    href: `/products/${product.slug}`,
    image,
    price,
    inStock,
    stockLabel: getStockLabel(inStock),
    isActive: product.isActive !== false && product.available !== false,
    category: resolveProductCategory(product),
    seo: resolveSeoFallback({
      title: product.seo?.metaTitle,
      description:
        product.seo?.metaDescription ??
        product.shortDescription ??
        product.description,
      fallbackTitle: `${product.title} | Katyayani Designer Hub`,
    }),
  };
}

export function normalizeProductDetail(
  product: ProductApiResponse,
): ProductDetailViewModel {
  const variants = (product.variants ?? []).map(normalizeVariant);
  const primaryVariant = pickPrimaryVariant(variants);
  const card = normalizeProductCard(product);

  return {
    ...card,
    description: product.description?.trim() ?? "",
    shortDescription:
      product.shortDescription?.trim() ??
      product.description?.trim().slice(0, 160) ??
      "",
    images: normalizeImages(product),
    variants,
    primaryVariant,
    tags: product.tags ?? [],
  };
}
