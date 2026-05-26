"use client";

import { useState } from "react";
import Slider, { type Settings } from "react-slick";
import { PRODUCT_IMAGE_FALLBACK } from "../lib/storefront/commerce";
import type { StorefrontImageViewModel } from "../lib/storefront/types/viewModels";
import { StorefrontImage } from "./storefront/StorefrontImage";

type ThumbArrowProps = {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  label: string;
};

function ThumbPrev({ className, style, onClick, label }: ThumbArrowProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${className ?? ""} product-detail-thumb-arrow product-detail-thumb-arrow--prev`}
      style={style}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}

function ThumbNext({ className, style, onClick, label }: ThumbArrowProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`${className ?? ""} product-detail-thumb-arrow product-detail-thumb-arrow--next`}
      style={style}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

export default function ProductDetailGallery({
  images,
  productName,
}: {
  images: StorefrontImageViewModel[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const safeImages =
    images.length > 0 ? images : [{ src: PRODUCT_IMAGE_FALLBACK, alt: productName }];
  const hasMultipleImages = safeImages.length > 1;

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setActive((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setActive((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const thumbSettings: Settings = {
    dots: false,
    infinite: false,
    speed: 320,
    slidesToShow: 5,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: hasMultipleImages,
    prevArrow: <ThumbPrev label="Previous product images" />,
    nextArrow: <ThumbNext label="Next product images" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  const main = safeImages[active] ?? safeImages[0];

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="relative aspect-3/3 w-full overflow-hidden rounded-xl bg-[#f4f4f4]">
        <StorefrontImage
          image={main}
          fallbackAlt={productName}
          fill
          priority
          className="object-cover object-center"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        {hasMultipleImages ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="product-detail-main-arrow product-detail-main-arrow--prev"
              aria-label="Previous product image"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="product-detail-main-arrow product-detail-main-arrow--next"
              aria-label="Next product image"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div className="product-detail-thumb-slider px-1">
          <Slider {...thumbSettings}>
            {safeImages.map((img, index) => (
              <div key={`${img.src}-${index}`} className="px-1.5 py-1 outline-none">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={`relative block w-full overflow-hidden rounded-md bg-[#f0f0f0] ring-2 transition-shadow focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2 focus-visible:outline-none ${
                    active === index
                      ? "ring-black ring-offset-2"
                      : "ring-transparent hover:ring-[#ccc]"
                  }`}
                  style={{ aspectRatio: "3 / 4" }}
                  aria-label={`Show image ${index + 1} of ${safeImages.length}`}
                  aria-pressed={active === index}
                >
                  <StorefrontImage
                    image={{ ...img, alt: "" }}
                    fill
                    className="object-cover object-center"
                    sizes="120px"
                  />
                </button>
              </div>
            ))}
          </Slider>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        Image {active + 1} of {safeImages.length} selected.
      </p>
    </div>
  );
}
