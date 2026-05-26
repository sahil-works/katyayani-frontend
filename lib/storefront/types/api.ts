export type ProductImageApiResponse = {
  id?: string;
  url?: string | null;
  src?: string | null;
  alt?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type ProductVariantApiResponse = {
  id: string;
  sku?: string | null;
  title?: string | null;
  image?: ProductImageApiResponse | string | null;
  images?: Array<ProductImageApiResponse | string> | null;
  price: number | string;
  salePrice?: number | string | null;
  effectivePrice?: number | string | null;
  hasSale?: boolean | null;
  stock?: number | null;
  stockQuantity?: number | null;
  stockStatus?: string | null;
  inStock?: boolean | null;
  available?: boolean | null;
  isActive?: boolean | null;
  options?: Record<string, string | number | boolean | null> | null;
};

export type CategoryApiResponse = {
  id: string;
  title?: string | null;
  name?: string | null;
  slug: string;
  description?: string | null;
  image?: ProductImageApiResponse | string | null;
  productCount?: number | null;
  isActive?: boolean | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
};

export type ProductApiResponse = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price?: number | string | null;
  salePrice?: number | string | null;
  images?: Array<ProductImageApiResponse | string> | null;
  variants?: ProductVariantApiResponse[] | null;
  category?: CategoryApiResponse | null;
  categories?: CategoryApiResponse[] | null;
  tags?: string[] | null;
  isActive?: boolean | null;
  inStock?: boolean | null;
  available?: boolean | null;
  stockStatus?: string | null;
  effectivePrice?: number | string | null;
  minEffectivePrice?: number | string | null;
  maxEffectivePrice?: number | string | null;
  hasSale?: boolean | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
  } | null;
};
