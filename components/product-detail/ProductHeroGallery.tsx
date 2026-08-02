"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { PRODUCT_IMAGE_FALLBACK } from "../../lib/storefront/commerce";
import type { StorefrontImageViewModel } from "../../lib/storefront/types/viewModels";
import { StorefrontImage } from "../storefront/StorefrontImage";
import { ProductImageLightbox } from "./ProductImageLightbox";

type ProductHeroGalleryProps = {
  images: StorefrontImageViewModel[];
  productName: string;
};

export default function ProductHeroGallery({
  images,
  productName,
}: ProductHeroGalleryProps) {
  const safeImages =
    images.length > 0
      ? images
      : [{ src: PRODUCT_IMAGE_FALLBACK, alt: productName }];
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultipleImages = safeImages.length > 1;
  const activeImage = safeImages[active] ?? safeImages[0];

  function showPreviousImage() {
    if (!hasMultipleImages) return;
    setActive((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    setActive((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }

  return (
    <section
      className={
        hasMultipleImages
          ? "grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)] lg:gap-5"
          : "grid gap-4"
      }
      aria-label={`${productName} image gallery`}
    >
      {hasMultipleImages ? (
        <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[760px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
          {safeImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-22 w-16 shrink-0 overflow-hidden rounded-full border bg-[#f6f1e9] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea206d] sm:h-26 sm:w-18 lg:h-28 lg:w-full lg:rounded-[999px] ${
                active === index
                  ? "border-[#1f1a14] opacity-100"
                  : "border-[#e5ded2] opacity-70 hover:border-[#ea206d] hover:opacity-100"
              }`}
              aria-label={`Show product image ${index + 1} of ${safeImages.length}`}
              aria-pressed={active === index}
            >
              <StorefrontImage
                image={{ ...image, alt: "" }}
                fill
                sizes="88px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className={hasMultipleImages ? "order-1 lg:order-2" : ""}>
        <div
          className={`relative overflow-hidden rounded-[4px] bg-[#f8f8f8] ${
            hasMultipleImages
              ? "aspect-[3/4] min-h-[min(52vh,360px)] sm:min-h-[520px] lg:aspect-auto lg:min-h-[760px]"
              : "aspect-[3/4] min-h-[min(48vh,320px)] sm:aspect-[4/5] sm:min-h-[520px] lg:min-h-[680px]"
          }`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea206d]"
            aria-label={`View ${productName} image ${active + 1} full screen`}
          >
            <StorefrontImage
              key={activeImage.src}
              image={activeImage}
              fallbackAlt={productName}
              fill
              priority
              className="object-contain object-center transition-opacity duration-200 group-hover:opacity-95"
              sizes="(min-width: 1024px) 58vw, 100vw"
            />
            <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/85 text-[#1e1a15] opacity-100 backdrop-blur transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
              <Expand className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden />
            </span>
          </button>

          {hasMultipleImages ? (
            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={showPreviousImage}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/85 text-[#1e1a15] backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea206d]"
                aria-label="Previous product image"
              >
                <ChevronLeft className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden />
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/85 text-[#1e1a15] backdrop-blur transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea206d]"
                aria-label="Next product image"
              >
                <ChevronRight className="h-4.5 w-4.5" strokeWidth={1.7} aria-hidden />
              </button>
            </div>
          ) : null}
        </div>

        <p className="sr-only" aria-live="polite">
          Image {active + 1} of {safeImages.length} selected.
        </p>
      </div>

      <ProductImageLightbox
        images={safeImages}
        productName={productName}
        activeIndex={active}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onActiveIndexChange={setActive}
      />
    </section>
  );
}
