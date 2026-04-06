"use client";

import Image from "next/image";
import Slider from "react-slick";

const bestCollectionItems = [
  {
    id: 1,
    title: "Brush painted Floral design Kurta",
    price: "Rs. 5,250.00",
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 2,
    title: "Brush painted Floral design Kurta",
    price: "Rs. 5,250.00",
    oldPrice: "Rs. 7,500.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 3,
    title: "Cotton Chanderi Elegant Suit Set",
    price: "Rs. 4,990.00",
    oldPrice: "Rs. 6,800.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 4,
    title: "Lightweight Crinkled Mul Cotton",
    price: "Rs. 5,450.00",
    oldPrice: "Rs. 7,100.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 5,
    title: "Hand-Embroidered Party Kurta",
    price: "Rs. 6,250.00",
    oldPrice: "Rs. 8,200.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 6,
    title: "Floral Printed Premium Suit",
    price: "Rs. 5,750.00",
    oldPrice: "Rs. 7,850.00",
    image: "/assets/images/banner-two.png",
  },
];

interface BestCollectionItem {
  id: number;
  title: string;
  price: string;
  oldPrice: string;
  image: string;
}

function BestCollectionCard({ item }: { item: BestCollectionItem }) {
  return (
    <article className="mx-2 flex overflow-hidden rounded-[20px] border border-[#e5e5de] bg-white">
      <div className="flex w-[50%] items-center px-6 py-6 sm:px-7">
        <div>
          <h3 className="max-w-[220px] text-[24px] leading-[1.35] font-medium text-[#111] sm:text-[24px] sm:leading-[1.16]">
            {item.title}
          </h3>
          <div className="mt-4 flex flex-nowrap items-center gap-3 leading-none whitespace-nowrap">
            <span className="text-[21px] font-medium text-[#9ea600] sm:text-[21px]">
              {item.price}
            </span>
            <span className="text-[18px] text-[#737373] line-through sm:text-[18px]">
              {item.oldPrice}
            </span>
          </div>
          <button
            type="button"
            className="mt-8 min-w-[118px] bg-[#9ea600] px-5 py-2 text-[19px] font-medium text-white"
          >
            Shop Now
          </button>
        </div>
      </div>

      <div className="relative w-[50%] min-h-[350px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover object-center"
          sizes="(min-width: 1024px) 360px, 100vw"
        />
      </div>
    </article>
  );
}

export default function BestCollectionSection() {
  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 450,
    slidesToShow: 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    customPaging: () => (
      <span className="block h-3 w-3 rounded-full bg-[#d8dcc0] transition-colors" />
    ),
    appendDots: (dots: React.ReactNode) => (
      <ul className="best-collection-dots">{dots}</ul>
    ),
  };

  return (
    <section className="bg-[#eeeee8] py-16">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-[43px] leading-none font-medium text-[#111] sm:text-[43px]">
            Katyayani&apos;s Best Collection
          </h2>
          <p className="mt-3 text-[19px] leading-[1.35] text-[#5e5e5e]">
            Be the first to explore our brand-new arrivals, crafted just for
            you.
          </p>
        </div>

        <div className="best-collection-slider mt-9">
          <Slider {...sliderSettings}>
            {bestCollectionItems.map((item) => (
              <BestCollectionCard key={item.id} item={item} />
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
