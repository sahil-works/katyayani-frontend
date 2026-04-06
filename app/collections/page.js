import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    id: 1,
    title: "New Arrivals",
    productsCount: 5592,
    image: "/assets/images/banner-one.png",
  },
  {
    id: 2,
    title: "Newly Added",
    productsCount: 2055,
    image: "/assets/images/banner-two.png",
  },
  {
    id: 3,
    title: "TISSUE COLLECTION",
    productsCount: 1138,
    image: "/assets/images/banner-one.png",
  },
  {
    id: 4,
    title: "Summer Kurta Sets",
    productsCount: 836,
    image: "/assets/images/banner-two.png",
  },
  {
    id: 5,
    title: "Handcrafted Edit",
    productsCount: 642,
    image: "/assets/images/banner-one.png",
  },
  {
    id: 6,
    title: "Party Wear",
    productsCount: 978,
    image: "/assets/images/banner-two.png",
  },
];

export const metadata = {
  title: "Collections | Katyayani Designer Hub",
  description: "Browse all collections at Katyayani Designer Hub.",
};

export default function CollectionsPage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-white">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 pb-18 lg:px-10">
        <div className="text-[14px] text-[#5c5c5c]">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          <span>Collections</span>
        </div>

        <section className="mt-9 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <article key={collection.id}>
              <Image
                src={collection.image}
                alt={collection.title}
                width={420}
                height={460}
                className="h-[320px] w-full rounded-[14px] object-cover"
                priority={collection.id <= 3}
              />
              <h2 className="mt-4 text-center text-[24px] leading-none font-normal text-[#2e2e2e]">
                {collection.title}
              </h2>
              <p className="mt-2 text-center text-[18px] leading-none text-[#9f9f9f]">
                {collection.productsCount} products
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
