import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const leftBannerImage = "/assets/images/banner-one.png";
const rightBannerImage = "/assets/images/banner-two.png";

export default function HeroBanner() {
  return (
    <section className="w-full bg-white">
      <div className="grid h-[620px] w-full grid-cols-1 md:grid-cols-3">
        <div
          className="h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${leftBannerImage}")` }}
          aria-label="Banner left image"
          role="img"
        />

        <div className="flex h-full flex-col items-center justify-center bg-black px-8 py-14 text-center text-white">
          <p
            className={`${dancingScript.className} text-[28px] leading-none text-white/95 md:text-[28px]`}
          >
            Decide on a Style
          </p>
          <h1 className="mt-5 max-w-[480px] text-[28px] font-medium leading-[1.25] md:text-[36px]">
            Expect the best from Katyayani Designer Hub
          </h1>
          <p className="mt-4 max-w-[460px] text-[16px] font-normal leading-[1.7] text-white/95 md:text-[20px]">
            Discover all the items with Affordable prices, and take advantage of
            our products.
          </p>
          <button
            type="button"
            className="mt-8 bg-[#9ea600] px-8 py-3 text-[18px] font-medium tracking-[0.01em] text-white md:text-[20px]"
          >
            Shop Now
          </button>
        </div>

        <div
          className="h-full bg-cover bg-center"
          style={{ backgroundImage: `url("${rightBannerImage}")` }}
          aria-label="Banner right image"
          role="img"
        />
      </div>
    </section>
  );
}
