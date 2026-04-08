import Image from "next/image";
import Link from "next/link";

export type YouMayAlsoLikeItem = {
  slug: string;
  name: string;
  priceLabel: string;
  imageSrc: string;
  imageAlt: string;
};

type Props = {
  items: YouMayAlsoLikeItem[];
};

export default function YouMayAlsoLikeSection({ items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-14 sm:py-16" aria-labelledby="you-may-also-like-heading">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <h2
            id="you-may-also-like-heading"
            className="mx-auto max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[32px] font-medium leading-none text-[#111] sm:text-[40px] lg:text-[43px]"
          >
            You May Also Like
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.slug} className="text-center">
              <Link
                href={`/products/${item.slug}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9ea600]"
              >
                <div className="relative overflow-hidden rounded-[18px]">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    width={305}
                    height={385}
                    className="h-[380px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <h3 className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[18px] leading-snug font-medium text-[#1f1f1f] sm:text-[20px] lg:text-[21px]">
                  {item.name}
                </h3>
                <p className="mt-2 text-[17px] leading-none font-medium text-[#9ea600] sm:text-[19px] lg:text-[20px]">
                  {item.priceLabel}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
