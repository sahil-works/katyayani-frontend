import { Dancing_Script } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const categories = [
  {
    id: 1,
    title: "Cotton Suits",
    image: "/assets/images/banner-one.png",
    slug: "cotton-suits",
  },
  {
    id: 2,
    title: "Muslin Suits",
    image: "/assets/images/banner-two.png",
    slug: "muslin-suits",
  },
  {
    id: 3,
    title: "Velvet Collection",
    image: "/assets/images/banner-one.png",
    slug: "velvet-collection",
  },
  {
    id: 4,
    title: "Silk Collection",
    image: "/assets/images/banner-two.png",
    slug: "silk-collection",
  },
  {
    id: 5,
    title: "Organza Suits",
    image: "/assets/images/banner-one.png",
    slug: "organza-suits",
  },
];

export default function ShopByCategoriesSection() {
  return (
    <section className="bg-[#eeeee9] py-14">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className={`${dancingScript.className} text-[24px] leading-none text-[#9ea600]`}>
              Browse by Style & Need
            </p>
            <h2 className="mt-3 text-[43px] leading-none font-medium text-[#111]">
              Shop By Categories
            </h2>
          </div>
          <p className="max-w-[360px] pt-2 text-[19px] leading-[1.35] text-[#555] sm:text-right">
            Easily find what you&apos;re looking for all neatly sorted by category.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/new-arrivals?category=${category.slug}`}
              className="group block text-center"
            >
              <article>
                <div className="overflow-hidden rounded-[16px]">
                  <Image
                    src={category.image}
                    alt={category.title}
                    width={245}
                    height={180}
                    className="h-[180px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-[21px] leading-none text-[#111] transition-colors group-hover:text-[#9ea600]">
                  {category.title}
                </h3>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
