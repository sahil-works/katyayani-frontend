"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";

const products = [
  {
    id: 1,
    title: "Brush Painted Floral Design Kurta",
    price: "Rs. 3,550.00",
    amount: 3550,
    createdAt: "2026-04-04",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 2,
    title: "Soft Organza Unstitched Suit",
    price: "Rs. 4,350.00",
    amount: 4350,
    createdAt: "2026-04-06",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 3,
    title: "Soft Organza Unstitched Suit",
    price: "Rs. 4,350.00",
    amount: 4350,
    createdAt: "2026-04-03",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 4,
    title: "Soft Organza Unstitched Suit",
    price: "Rs. 4,350.00",
    amount: 4350,
    createdAt: "2026-04-05",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 5,
    title: "Printed Organza Kurta Set",
    price: "Rs. 3,950.00",
    amount: 3950,
    createdAt: "2026-04-02",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 6,
    title: "Floral Organza Party Suit",
    price: "Rs. 4,650.00",
    amount: 4650,
    createdAt: "2026-04-01",
    image: "/assets/images/banner-two.png",
  },
  {
    id: 7,
    title: "Chic Organza Embroidered Suit",
    price: "Rs. 4,150.00",
    amount: 4150,
    createdAt: "2026-03-31",
    image: "/assets/images/banner-one.png",
  },
  {
    id: 8,
    title: "Pastel Organza Straight Kurta",
    price: "Rs. 3,750.00",
    amount: 3750,
    createdAt: "2026-03-30",
    image: "/assets/images/banner-two.png",
  },
];

export default function NewArrivalsPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date-desc");

  const sortedProducts = useMemo(() => {
    const clonedProducts = [...products];

    if (sortBy === "date-desc") {
      return clonedProducts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

    if (sortBy === "date-asc") {
      return clonedProducts.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    }

    if (sortBy === "price-asc") {
      return clonedProducts.sort((a, b) => a.amount - b.amount);
    }

    if (sortBy === "price-desc") {
      return clonedProducts.sort((a, b) => b.amount - a.amount);
    }

    if (sortBy === "title-asc") {
      return clonedProducts.sort((a, b) => a.title.localeCompare(b.title));
    }

    return clonedProducts;
  }, [sortBy]);

  return (
    <main className="min-h-[calc(100vh-96px)] bg-white">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 pb-18 lg:px-10">
        <div className="text-[14px] text-[#5c5c5c]">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          <span className="tracking-[0.03em] uppercase">Organza Suits</span>
        </div>

        <h1 className="mt-14 text-center text-[38px] leading-none font-medium tracking-[0.02em] text-[#222]">
          ORGANZA SUITS
        </h1>

        <section className="mt-16 grid gap-10 lg:grid-cols-[300px_1fr]">
          <aside className="sticky top-5 self-start rounded-xl border border-[#ececec] bg-[#fcfcfc] p-6 lg:p-7">
            <h2 className="text-[24px] leading-none font-medium text-[#2d2d2d]">
              Filter
            </h2>

            <div className="mt-7 border-t border-[#ececec] pt-6">
              <button
                type="button"
                className="flex w-full items-center text-left text-[18px] leading-none font-medium text-[#242424]"
              >
                <span>Availability</span>
              </button>

              <div className="mt-5 space-y-3.5 text-[15px] text-[#4a4a4a]">
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="new-arrivals-checkbox h-4 w-4"
                  />
                  <span>In stock (164)</span>
                </label>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="new-arrivals-checkbox h-4 w-4"
                  />
                  <span>Out of stock (500)</span>
                </label>
              </div>
            </div>

            <div className="mt-8 border-y border-[#ececec] py-6">
              <button
                type="button"
                className="flex w-full items-center text-left text-[18px] leading-none font-medium text-[#242424]"
              >
                <span>Price</span>
              </button>

              <div className="mt-8">
                <input
                  type="range"
                  min="0"
                  max="9495"
                  defaultValue="0"
                  className="new-arrivals-range w-full accent-[#222]"
                  aria-label="Minimum price"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-md border border-[#e6e6e6] bg-white px-3 py-2 text-[14px] text-[#4a4a4a]">
                  <span className="text-[#666]">₹</span>
                  <span>0</span>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-[#e6e6e6] bg-white px-3 py-2 text-[14px] text-[#4a4a4a]">
                  <span className="text-[#666]">₹</span>
                  <span>9495.00</span>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  className={`inline-flex h-[34px] w-[34px] items-center justify-center border transition-colors ${
                    viewMode === "grid"
                      ? "border-[#d8d8d8] bg-[#f3f3f3] text-[#222]"
                      : "border-[#ebebeb] bg-transparent text-[#8b8b8b]"
                  }`}
                >
                  <LayoutGrid className="h-[17px] w-[17px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  className={`inline-flex h-[34px] w-[34px] items-center justify-center border transition-colors ${
                    viewMode === "list"
                      ? "border-[#d8d8d8] bg-[#f3f3f3] text-[#222]"
                      : "border-[#ebebeb] bg-transparent text-[#8b8b8b]"
                  }`}
                >
                  <List className="h-[17px] w-[17px]" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-7 text-[18px] text-[#5a5a5a]">
                <div className="flex items-center gap-2">
                  <span>Sort By:</span>
                  <div className="group relative">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className="h-11 min-w-[210px] appearance-none rounded-md border border-[#d9d9d9] bg-white pl-4 pr-10 text-[16px] text-[#2f2f2f] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all outline-none hover:border-[#bfbfbf] focus:border-[#9ea600] focus:ring-2 focus:ring-[#9ea600]/20"
                      aria-label="Sort products"
                    >
                      <option value="date-desc">Date, new to old</option>
                      <option value="date-asc">Date, old to new</option>
                      <option value="price-asc">Price, low to high</option>
                      <option value="price-desc">Price, high to low</option>
                      <option value="title-asc">Alphabetically, A-Z</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-[16px] w-[16px] -translate-y-1/2 text-[#747474] transition-colors group-hover:text-[#525252]" />
                  </div>
                </div>
                <span>564 Products</span>
              </div>
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3"
                  : "grid grid-cols-1 gap-6 md:grid-cols-2"
              }
            >
              {sortedProducts.map((product) => (
                <article
                  key={product.id}
                  className={
                    viewMode === "list"
                      ? "flex flex-col gap-4 border border-[#efefef] p-4 sm:flex-row sm:items-center"
                      : ""
                  }
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={250}
                    height={380}
                    className={
                      viewMode === "list"
                        ? "h-[220px] w-full rounded-[14px] object-cover sm:w-[190px]"
                        : "h-[380px] w-full rounded-[14px] object-cover"
                    }
                  />
                  <div className={viewMode === "list" ? "sm:text-left" : ""}>
                    <h3
                      className={`text-[20px] leading-[1.1] font-medium text-[#222] ${
                        viewMode === "list"
                          ? "mt-2 text-left"
                          : "mt-5 text-center whitespace-nowrap overflow-hidden text-ellipsis"
                      }`}
                    >
                      {product.title}
                    </h3>
                    <p
                      className={`text-[20px] leading-none text-[#444] ${
                        viewMode === "list" ? "mt-3 text-left" : "mt-4 text-center"
                      }`}
                    >
                      {product.price}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
