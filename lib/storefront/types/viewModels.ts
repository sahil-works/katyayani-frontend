export type StorefrontImageViewModel = {
  src: string;
  alt: string;
};

export type CategoryViewModel = {
  id: string;
  title: string;
  slug: string;
  href: string;
  description: string;
  image: StorefrontImageViewModel;
  productCount?: number;
  seo: SeoViewModel;
};

export type SeoViewModel = {
  title: string;
  description: string;
};

export type ProductPriceViewModel = {
  price: number;
  salePrice?: number;
  effectivePrice: number;
  minEffectivePrice: number;
  maxEffectivePrice: number;
  currency: "INR";
  formattedPrice: string;
  formattedSalePrice?: string;
  formattedEffectivePrice: string;
  formattedPriceRange: string;
  hasSale: boolean;
};

export type ProductVariantViewModel = {
  id: string;
  sku?: string;
  title: string;
  options: Record<string, string | number | boolean | null>;
  images: StorefrontImageViewModel[];
  price: ProductPriceViewModel;
  inStock: boolean;
  stockLabel: string;
  stockQuantity?: number;
  isActive: boolean;
};

export type ProductCardViewModel = {
  id: string;
  title: string;
  slug: string;
  href: string;
  image: StorefrontImageViewModel;
  price: ProductPriceViewModel;
  inStock: boolean;
  stockLabel: string;
  isActive: boolean;
  /** Primary category, mirrors `categories[0]`. */
  category?: CategoryViewModel;
  categories: CategoryViewModel[];
  seo: SeoViewModel;
  /** Default variant used for one-click add-to-cart from listing cards. */
  primaryVariant?: ProductVariantViewModel;
  hasMultipleVariants: boolean;
};

export type ProductDetailViewModel = ProductCardViewModel & {
  description: string;
  shortDescription: string;
  images: StorefrontImageViewModel[];
  variants: ProductVariantViewModel[];
  primaryVariant?: ProductVariantViewModel;
  tags: string[];
};
