import type { StorefrontImageViewModel } from "../storefront/types/viewModels";

export type CartLineIdentity = {
  productId: string;
  variantId: string;
};

export type CartLineViewModel = CartLineIdentity & {
  id: string;
  productTitle: string;
  slug: string;
  category?: string;
  variantTitle?: string;
  image: StorefrontImageViewModel;
  quantity: number;
  effectivePrice: number;
  formattedEffectivePrice: string;
  lineSubtotal: number;
  formattedLineSubtotal: string;
  inStock: boolean;
  available: boolean;
  stockLabel: string;
  invalidReason?: string;
};

export type CartViewModel = {
  lines: CartLineViewModel[];
  invalidLines: CartLineViewModel[];
  itemCount: number;
  subtotal: number;
  formattedSubtotal: string;
  hasInvalidItems: boolean;
};

export type AddCartLineInput = CartLineIdentity & {
  quantity: number;
  productTitle: string;
  slug: string;
  category?: string;
  variantTitle?: string;
  image: StorefrontImageViewModel;
  effectivePrice: number;
  inStock: boolean;
  available: boolean;
  stockLabel: string;
};
