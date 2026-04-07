import {
  Headphones,
  PackageX,
  TicketSlash,
  Truck,
} from "lucide-react";

const CARE_TICKER_SEGMENT =
  "Dry clean first, then regular wash thereafter";

/** One scrolling half: single line so the strip never wraps into stacked rows. */
function CareTickerHalf({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  const line = Array.from({ length: 12 }, () => CARE_TICKER_SEGMENT).join(
    "   ·   ",
  );
  return (
    <span
      className="inline-block shrink-0 whitespace-nowrap px-8 text-[13px] font-medium tracking-wide text-white sm:text-[14px]"
      aria-hidden={ariaHidden}
    >
      {line}
    </span>
  );
}

export default function ProductDetailPostPurchaseSection() {
  const features = [
    {
      icon: Truck,
      label: "Free Shipping",
    },
    {
      icon: Headphones,
      label: "Quality Support",
    },
    {
      icon: PackageX,
      label: "No Refund And Exchange",
    },
    {
      icon: TicketSlash,
      label: "No Discount Code",
    },
  ] as const;

  return (
    <section
      className="w-full border-t border-[#e8e8e8] text-[#111]"
      aria-labelledby="product-post-purchase-heading"
    >
      <div className="bg-white px-6 py-10 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-[1320px] text-center">
          <p className="text-[15px] font-medium text-black sm:text-[16px]">
            Important!
          </p>
          <h2
            id="product-post-purchase-heading"
            className="mt-2 text-[25px] font-bold tracking-tight text-black sm:text-[24px] md:text-[30px]"
          >
            Record Parcel Opening Video
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-[#666] sm:text-[15px]">
            We kindly request you to record a short video while unpacking your
            parcel. This helps us ensure the product reaches you in perfect
            condition.
          </p>
          <p className="mt-6 text-[15px] font-medium text-black sm:text-[16px]">
            Thank you!
          </p>
        </div>
      </div>

      <div className="bg-black">
        <div className="product-detail-care-ticker-viewport py-2.5 sm:py-3">
          <div className="product-detail-care-ticker-track">
            <CareTickerHalf />
            <CareTickerHalf aria-hidden />
          </div>
        </div>
      </div>

      <div className="bg-[#f5f5f5] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <ul className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6 lg:gap-8">
          {features.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center gap-3 text-center"
            >
              <Icon
                className="h-8 w-8 text-[#111] sm:h-9 sm:w-9"
                strokeWidth={1.35}
                aria-hidden
              />
              <span className="max-w-[140px] text-[14px] font-medium leading-snug text-black sm:max-w-none sm:text-[15px]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
