"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";
import {
  PRODUCT_IMAGE_FALLBACK,
  resolveImageFallback,
} from "../../lib/storefront/commerce";
import type { StorefrontImageViewModel } from "../../lib/storefront/types/viewModels";

type StorefrontImageProps = Omit<ImageProps, "src" | "alt" | "onError"> & {
  image: StorefrontImageViewModel;
  fallbackSrc?: string;
  fallbackAlt?: string;
};

export function StorefrontImage({
  image,
  fallbackSrc = PRODUCT_IMAGE_FALLBACK,
  fallbackAlt,
  ...props
}: StorefrontImageProps) {
  const resolvedImage = useMemo(
    () =>
      resolveImageFallback({
        src: image.src,
        alt: image.alt,
        fallbackSrc,
        fallbackAlt: fallbackAlt ?? image.alt,
      }),
    [fallbackAlt, fallbackSrc, image.alt, image.src],
  );
  const [src, setSrc] = useState(resolvedImage.src);

  return (
    <Image
      {...props}
      src={src}
      alt={resolvedImage.alt}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}
