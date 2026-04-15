"use client";

import { Dancing_Script } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useCartSidebar } from "./CartSidebar";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const products = [
  {
    id: 1,
    slug: "mul-cotton-chanderi-unstitched-suits",
    title: "Cotron Chanderi Elegant Suit Set",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 2,
    slug: "mul-cotton-chanderi-unstitched-pearl",
    title: "Lightweight Crinkled Mul Cotton Suit",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 3,
    slug: "mul-chanderi-unstitched-suits",
    title: "Cotron Chanderi Elegant Suit Set",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 4,
    slug: "mirror-work-suit-set",
    title: "Crushed Tissue Unstitched Suits",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 5,
    slug: "silk-blend-festive-suit",
    title: "Stunning Long Ethnic Dress Ajrakh",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 6,
    slug: "mul-cotton-chanderi-unstitched-suits",
    title: "Hand-Embroidered Kurta With Work",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 7,
    slug: "mul-cotton-chanderi-unstitched-pearl",
    title: "Soft Mul Cotton Unstitched Suit",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 8,
    slug: "mul-chanderi-unstitched-suits",
    title: "Ivory & Slate Blue Textured Suit",
    price: "Rs. 5,250.00",
    unitPrice: 5250,
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-one.png",
  },
];

export default function NewArrivalsSection() {
  const { addLine, openCart } = useCartSidebar();

  return (
    <section className="bg-[#f1f1f1] py-14">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className={`${dancingScript.className} text-[24px] leading-none text-[#9ea600]`}>
              Be the first to try our new collection
            </p>
            <h2 className="mt-3 text-[43px] leading-none font-medium text-[#111]">
              New Arrivals
            </h2>
          </div>
          <p className="max-w-[360px] pt-2 text-[19px] leading-[1.35] text-[#555] text-right">
            New season, new vibes, new arrivals because you deserve the freshest
            picks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id}>
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative overflow-hidden rounded-[18px]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={305}
                    height={385}
                    className="h-[380px] w-full object-cover"
                  />
                </div>
                <h3 className="mt-3 line-clamp-1 text-[21px] text-[#1f1f1f]">
                  {product.title}
                </h3>
              </Link>
              <div className="my-3 flex flex-nowrap items-center gap-2 whitespace-nowrap leading-none">
                <span className="text-[22px] font-medium text-[#9ea600]">{product.price}</span>
                <span className="text-[18px] text-[#7a7a7a] line-through">
                  {product.oldPrice}
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <button
                  type="button"
                  className="cursor-pointer border-b border-[#868686] pb-0.5 text-[18px] leading-none text-[#404040] transition-colors hover:text-black"
                  onClick={() => {
                    addLine({
                      id: `new-arrival-${product.id}`,
                      name: product.title,
                      unitPrice: product.unitPrice,
                      imageSrc: product.image,
                    });
                    openCart();
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="min-w-[118px] bg-[#9ea600] px-6 py-3 text-[20px] font-medium text-white"
          >
            View all
          </button>
        </div>
      </div>
    </section>
  );
}
