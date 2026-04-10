import Image from "next/image";
import Link from "next/link";

type SilkItem = {
  id: number;
  slug: string;
  name: string;
  priceLabel: string;
  imageSrc: string;
  imageAlt: string;
  soldOut?: boolean;
};

const silkItems: SilkItem[] = [
  {
    id: 1,
    slug: "mul-cotton-chanderi-unstitched-suits",
    name: "Yellow & Pink Suit Set",
    priceLabel: "Rs. 5,850.00",
    imageSrc: "/assets/images/banner-one.png",
    imageAlt: "Yellow and pink suit set",
  },
  {
    id: 2,
    slug: "mul-cotton-chanderi-unstitched-pearl",
    name: "Pure SATIN SILK FABRIC SUIT",
    priceLabel: "Rs. 3,950.00",
    imageSrc: "/assets/images/banner-two.png",
    imageAlt: "Pure satin silk fabric suit",
    soldOut: true,
  },
  {
    id: 3,
    slug: "mul-chanderi-unstitched-suits",
    name: "Rani Pink Handwork Kurta Set",
    priceLabel: "Rs. 6,250.00",
    imageSrc: "/assets/images/sets.png",
    imageAlt: "Rani pink handwork kurta set",
  },
  {
    id: 4,
    slug: "mirror-work-suit-set",
    name: "Maheshwari Silk Suit",
    priceLabel: "Rs. 3,995.00",
    imageSrc: "/assets/images/banner-two.png",
    imageAlt: "Maheshwari silk suit",
  },
  {
    id: 5,
    slug: "silk-blend-festive-suit",
    name: "Silk With Smooth Soft Sheen And Structured Fall",
    priceLabel: "Rs. 3,550.00",
    imageSrc: "/assets/images/banner-one.png",
    imageAlt: "Silk suit with smooth sheen",
  },
];

export default function SilkCollectionSection() {
  return (
    <section className="bg-[#f3f3f3] pt-14 sm:pt-16" aria-labelledby="silk-collection-heading">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <h2
          id="silk-collection-heading"
          className="mx-auto max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[32px] leading-none font-medium text-[#111] sm:text-[40px] lg:text-[43px]"
        >
          Silk Collection
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
          {silkItems.map((item) => (
            <article key={item.id} className="text-center">
              <Link href={`/products/${item.slug}`} className="block">
                <div className="relative overflow-hidden rounded-[4px] bg-white">
                  {item.soldOut ? (
                    <span className="absolute left-2 top-2 z-10 rounded bg-white/95 px-2 py-1 text-[10px] font-medium text-[#4a4a4a]">
                      Sold Out
                    </span>
                  ) : null}
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    width={246}
                    height={320}
                    className="h-[240px] w-full object-cover sm:h-[280px] lg:h-[320px]"
                  />
                </div>
                <h3 className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[18px] leading-tight font-medium text-[#1f1f1f] sm:text-[20px]">
                  {item.name}
                </h3>
              </Link>
              <p className="mt-2 text-[17px] leading-none text-[#585858] sm:text-[19px]">
                {item.priceLabel}
              </p>
            </article>
          ))}
        </div>

        <div className="pb-12 pt-10 text-center">
          <Link
            href="/collections"
            className="text-[13px] font-semibold tracking-[0.08em] text-[#222] underline underline-offset-[5px]"
          >
            SHOW ALL
          </Link>
        </div>
      </div>

      <div className="bg-black">
        <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-6 px-6 py-8 sm:flex-row sm:items-center lg:px-10">
          <div>
            <h3 className="text-[34px] leading-none font-medium text-white">New Collection</h3>
            <p className="mt-3 text-[20px] text-white/85">Discover the Latest Trends & Styles</p>
          </div>
          <Link
            href="/collections"
            className="inline-flex min-h-[52px] min-w-[210px] items-center justify-center rounded-full border border-white/80 px-8 text-[15px] font-medium tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-black"
          >
            SHOP COLLECTION
          </Link>
        </div>
      </div>
    </section>
  );
}
