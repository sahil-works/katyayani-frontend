/**
 * Static product catalog for PDPs. Replace with API / CMS fetch when ready.
 */
export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  collectionLabel: string;
  collectionHref: string;
  priceInr: number;
  sku: string;
  inStock: boolean;
  description: string;
  freeShippingNote: string;
  careGuide: string;
  images: ProductImage[];
};

const products: ProductDetail[] = [
  {
    slug: "mul-cotton-chanderi-unstitched-suits",
    name: "Mul cotton chanderi Unstitched Suits",
    collectionLabel: "CHANDERI COLLECTION",
    collectionHref: "/collections",
    priceInr: 2850,
    sku: "AE0883",
    inStock: true,
    description:
      "Lightweight mul cotton chanderi with subtle sheen, ideal for festive and everyday elegance. This unstitched suit set includes fabric for kurta, bottom, and dupatta so you can tailor it to your perfect fit.",
    freeShippingNote:
      "Free standard shipping on orders above the threshold. Delivery times vary by pincode; tracking is shared once your order ships.",
    careGuide:
      "Dry clean recommended for the first wash. Store folded with muslin; avoid prolonged direct sunlight. Iron on low with a protective cloth over embroidery.",
    images: [
      {
        src: "/assets/images/banner-one.png",
        alt: "Mul cotton chanderi suit — front fabric detail",
      },
      {
        src: "/assets/images/banner-two.png",
        alt: "Mul cotton chanderi suit — alternate angle",
      },
      {
        src: "/assets/images/sets.png",
        alt: "Mul cotton chanderi suit — full set layout",
      },
      {
        src: "/assets/images/banner-one.png",
        alt: "Mul cotton chanderi suit — embroidery close-up",
      },
      {
        src: "/assets/images/banner-two.png",
        alt: "Mul cotton chanderi suit — texture",
      },
    ],
  },
  {
    slug: "mul-cotton-chanderi-unstitched-pearl",
    name: "Mul Cotton Chanderi Unstitched Suits",
    collectionLabel: "CHANDERI COLLECTION",
    collectionHref: "/collections",
    priceInr: 2850,
    sku: "AE0884",
    inStock: true,
    description:
      "Mul cotton chanderi in a soft pearl tone with delicate weave. Unstitched set for kurta, bottom, and dupatta — tailor to your measurements.",
    freeShippingNote:
      "Free standard shipping on orders above the threshold. Delivery times vary by pincode; tracking is shared once your order ships.",
    careGuide:
      "Dry clean recommended for the first wash. Store folded with muslin; avoid prolonged direct sunlight.",
    images: [
      {
        src: "/assets/images/banner-two.png",
        alt: "Mul cotton chanderi unstitched suits — fabric detail",
      },
      { src: "/assets/images/banner-one.png", alt: "Mul cotton chanderi — alternate view" },
    ],
  },
  {
    slug: "mul-chanderi-unstitched-suits",
    name: "Mul Chanderi Unstitched Suits",
    collectionLabel: "CHANDERI COLLECTION",
    collectionHref: "/collections",
    priceInr: 2995,
    sku: "AE0901",
    inStock: true,
    description:
      "Rich mul chanderi unstitched suit set with refined drape. Includes fabric for kurta, salwar or pant, and dupatta.",
    freeShippingNote:
      "Free standard shipping on orders above the threshold. Delivery times vary by pincode; tracking is shared once your order ships.",
    careGuide:
      "Dry clean first wash; thereafter gentle hand wash cold. Dry in shade; cool iron.",
    images: [
      { src: "/assets/images/sets.png", alt: "Mul chanderi unstitched suit set folded layout" },
      { src: "/assets/images/banner-one.png", alt: "Mul chanderi — embroidery detail" },
    ],
  },
  {
    slug: "mirror-work-suit-set",
    name: "Mirror Work Suit Set",
    collectionLabel: "CHANDERI COLLECTION",
    collectionHref: "/collections",
    priceInr: 4495,
    sku: "AE1120",
    inStock: true,
    description:
      "Statement mirror work across yoke and borders on premium base fabric. Unstitched set ready for your tailor.",
    freeShippingNote:
      "Free standard shipping on orders above the threshold. Delivery times vary by pincode; tracking is shared once your order ships.",
    careGuide:
      "Dry clean only to protect mirror and thread work. Store on a hanger or folded with tissue between folds.",
    images: [
      { src: "/assets/images/banner-one.png", alt: "Mirror work suit set — full view" },
      { src: "/assets/images/banner-two.png", alt: "Mirror work — close-up" },
    ],
  },
  {
    slug: "silk-blend-festive-suit",
    name: "Silk Blend Festive Suit",
    collectionLabel: "CHANDERI COLLECTION",
    collectionHref: "/collections",
    priceInr: 3750,
    sku: "AE1044",
    inStock: true,
    description:
      "Silk-blend unstitched suit with subtle lustre, ideal for festive occasions. Kurta, bottom, and dupatta fabric included.",
    freeShippingNote:
      "Free standard shipping on orders above the threshold. Delivery times vary by pincode; tracking is shared once your order ships.",
    careGuide:
      "Dry clean recommended. Iron on low with cloth barrier; avoid perfume directly on fabric.",
    images: [
      { src: "/assets/images/banner-two.png", alt: "Silk blend festive suit fabric" },
      { src: "/assets/images/sets.png", alt: "Silk blend suit set layout" },
    ],
  },
];

export function getProductBySlug(slug: string): ProductDetail | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

/** Other catalog products for PDP recommendations (same order as catalog, cap at `limit`). */
export function getYouMayAlsoLikeProducts(
  excludeSlug: string,
  limit = 4,
): ProductDetail[] {
  return products.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
