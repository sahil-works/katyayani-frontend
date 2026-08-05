import AnimateOnView from "./AnimateOnView";

const homeBannerImage = "/assets/images/home-hero-banner.png";

export default function HeroBanner() {
  return (
    <AnimateOnView
      as="section"
      animation="fadeIn"
      duration={1}
      threshold={0.01}
      rootMargin="0px"
      className="w-full overflow-hidden bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={homeBannerImage}
        alt="Expect the best from Katyayani Designer Hub — Discover all the items with affordable prices, and take advantage of our products."
        className="block h-auto w-full max-w-none object-cover object-center"
        width={2560}
        height={800}
        decoding="async"
        fetchPriority="high"
      />
    </AnimateOnView>
  );
}
