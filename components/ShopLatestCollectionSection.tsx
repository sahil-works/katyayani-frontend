import Image from "next/image";
import { Play } from "lucide-react";

const collectionItems = [
  {
    id: 1,
    title: "Straight Cut Velvet Tunic",
    price: "Rs. 6,250.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 2,
    title: "Straight Cut Velvet Tunic",
    price: "Rs. 6,250.00",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 3,
    title: "Straight Cut Velvet Tunic",
    price: "Rs. 6,250.00",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 4,
    title: "Straight Cut Velvet Tunic",
    price: "Rs. 6,250.00",
    image: "/assets/images/banner-two.png",
  },
];

export default function ShopLatestCollectionSection() {
  return (
    <section className="bg-[#f5f5f5] py-16">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <h2 className="text-[43px] leading-none font-medium text-[#111]">
            Shop Latest Collection
          </h2>
          <p className="mt-3 text-[19px] leading-[1.35] text-[#6c6c6c]">
            Be the first to explore our brand-new arrivals, crafted just for you.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {collectionItems.map((item) => (
            <article key={item.id}>
              <div className="relative overflow-hidden rounded-[18px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={305}
                  height={385}
                  className="h-[380px] w-full object-cover"
                />
                <button
                  type="button"
                  aria-label={`Play ${item.title} video`}
                  className="absolute top-1/2 left-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8a8a8a] shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
                >
                  <Play className="h-5 w-5 fill-current" strokeWidth={0.5} />
                </button>
              </div>

              <h3 className="mt-3 line-clamp-1 text-[21px] text-[#1f1f1f]">
                {item.title}
              </h3>
              <p className="mt-2 text-[20px] leading-none font-medium text-[#9ea600]">
                {item.price}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
