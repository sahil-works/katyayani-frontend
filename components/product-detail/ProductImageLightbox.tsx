"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { StorefrontImageViewModel } from "../../lib/storefront/types/viewModels";
import { StorefrontImage } from "../storefront/StorefrontImage";

type ProductImageLightboxProps = {
  images: StorefrontImageViewModel[];
  productName: string;
  activeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onActiveIndexChange: (index: number) => void;
};

export function ProductImageLightbox({
  images,
  productName,
  activeIndex,
  isOpen,
  onClose,
  onActiveIndexChange,
}: ProductImageLightboxProps) {
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex] ?? images[0];

  function showPreviousImage() {
    if (!hasMultipleImages) return;
    onActiveIndexChange(
      activeIndex === 0 ? images.length - 1 : activeIndex - 1,
    );
  }

  function showNextImage() {
    if (!hasMultipleImages) return;
    onActiveIndexChange(
      activeIndex === images.length - 1 ? 0 : activeIndex + 1,
    );
  }

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (!hasMultipleImages) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onActiveIndexChange(
          activeIndex === 0 ? images.length - 1 : activeIndex - 1,
        );
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onActiveIndexChange(
          activeIndex === images.length - 1 ? 0 : activeIndex + 1,
        );
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [
    activeIndex,
    hasMultipleImages,
    images.length,
    isOpen,
    onActiveIndexChange,
    onClose,
  ]);

  if (!isOpen || !activeImage) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close full screen image view"
        className="fixed inset-0 z-100 bg-black/92 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${productName} full screen image gallery`}
        className="pointer-events-none fixed inset-0 z-101 flex items-center justify-center p-4 sm:p-8"
      >
        <div className="pointer-events-auto relative flex h-full w-full max-w-[1400px] items-center justify-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-2 sm:top-2"
            aria-label="Close full screen image view"
          >
            <X className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          </button>

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-2 sm:h-12 sm:w-12"
                aria-label="Previous product image"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </button>

              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-0 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-2 sm:h-12 sm:w-12"
                aria-label="Next product image"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </button>
            </>
          ) : null}

          <div className="relative h-full w-full max-h-[calc(100vh-6rem)] max-w-[calc(100vw-6rem)]">
            <StorefrontImage
              key={activeImage.src}
              image={activeImage}
              fallbackAlt={productName}
              fill
              priority
              className="object-contain object-center"
              sizes="100vw"
            />
          </div>

          {hasMultipleImages ? (
            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/35 px-4 py-1.5 text-[14px] text-white/90 backdrop-blur">
              {activeIndex + 1} / {images.length}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
