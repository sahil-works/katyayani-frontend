"use client";

import Image from "next/image";
import Link from "next/link";
import Slider, { type Settings } from "react-slick";
import { useCartSidebar } from "../../components/CartSidebar";
import Footer from "../../components/Footer";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

const recommendedProducts = [
  {
    id: "rec-1",
    name: "Soft Mul Cotton Suit",
    priceInr: 5850,
    image: "/assets/images/banner-one.png",
  },
  {
    id: "rec-2",
    name: "Soft Mul Cotton Suit",
    priceInr: 5850,
    image: "/assets/images/banner-two.png",
  },
  {
    id: "rec-3",
    name: "Soft Mul Cotton Suit",
    priceInr: 5850,
    image: "/assets/images/sets.png",
  },
  {
    id: "rec-4",
    name: "Ivory Floral Embroidered Co-Ord Set",
    priceInr: 4650,
    image: "/assets/images/banner-one.png",
  },
  {
    id: "rec-5",
    name: "Black & White Check Set With Dupatta And Pants",
    priceInr: 4650,
    image: "/assets/images/banner-two.png",
  },
  {
    id: "rec-6",
    name: "Scalloped Embroidered Pastel Muslin Ensemble",
    priceInr: 3250,
    image: "/assets/images/sets.png",
  },
  {
    id: "rec-7",
    name: "Scalloped Embroidered Pastel Muslin Ensemble",
    priceInr: 3250,
    image: "/assets/images/banner-one.png",
  },
];

function SliderArrow({
  onClick,
  direction,
}: {
  onClick?: () => void;
  direction: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-[38%] z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#dddddd] bg-white text-[#444] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f5f5f5] ${
        direction === "left" ? "-left-3" : "-right-3"
      }`}
      aria-label={direction === "left" ? "Previous slide" : "Next slide"}
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
}

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeLine } = useCartSidebar();
  const sliderSettings: Settings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <SliderArrow direction="right" />,
    prevArrow: <SliderArrow direction="left" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1080, settings: { slidesToShow: 3 } },
      { breakpoint: 840, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
      { breakpoint: 420, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px]">
        <h1 className="text-[32px] font-medium text-[#1f1f1f]">Your Cart</h1>

        {lines.length === 0 ? (
          <section className="mt-8 rounded-md border border-[#e1e1e1] bg-white p-8">
            <p className="text-[18px] text-[#333]">Your cart is currently empty.</p>
            <Link
              href="/collections"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[14px] font-semibold tracking-[0.06em] text-white"
            >
              CONTINUE SHOPPING
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <section>
              <div className="overflow-hidden rounded-md border border-[#e1e1e1] bg-white">
                <div className="hidden grid-cols-[minmax(0,1fr)_180px_180px] border-b border-[#e9e9e9] px-6 py-4 text-[16px] text-[#2b2b2b] md:grid">
                  <p>Product</p>
                  <p className="text-center">Quantity</p>
                  <p className="text-right">Total</p>
                </div>

                <ul>
                  {lines.map((line) => {
                    const lineTotal = line.unitPrice * line.quantity;

                    return (
                      <li
                        key={line.id}
                        className="grid grid-cols-1 gap-4 border-b border-[#ececec] px-4 py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_180px_180px] md:items-center md:px-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative h-[94px] w-[72px] shrink-0 overflow-hidden rounded-sm border border-[#e4e4e4] bg-[#f9f9f9]">
                            <Image
                              src={line.imageSrc}
                              alt={line.name}
                              fill
                              sizes="72px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[22px] leading-tight font-medium text-[#1f1f1f]">
                              {line.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              className="mt-2 text-[14px] text-[#6a6a6a] hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="md:justify-self-center">
                          <div className="inline-flex h-11 items-center rounded-sm border border-[#dedede]">
                            <button
                            
                              type="button"
                              onClick={() => updateQuantity(line.id, line.quantity - 1)}
                              className="grid h-full w-11 place-items-center text-[18px] text-[#444] hover:bg-[#f4f4f4]"
                              aria-label={`Decrease quantity for ${line.name}`}
                            >
                              -
                            </button>
                            <span className="grid h-full min-w-[42px] place-items-center border-x border-[#dedede] text-[14px]">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(line.id, line.quantity + 1)}
                              className="grid h-full w-11 place-items-center text-[18px] text-[#444] hover:bg-[#f4f4f4]"
                              aria-label={`Increase quantity for ${line.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <p className="text-left text-[22px] font-medium text-[#2b2b2b] md:text-right">
                          {formatInr(lineTotal)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <section className="mt-6 rounded-md border border-[#e1e1e1] bg-white p-4 sm:p-6">
                <h2 className="text-[28px] font-medium text-[#1f1f1f]">Get shipping estimates</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[14px] text-[#3b3b3b]">Country</label>
                    <select className="h-11 w-full rounded-sm border border-[#dedede] px-3 text-[14px] outline-none">
                      <option>India</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[14px] text-[#3b3b3b]">Province</label>
                    <select className="h-11 w-full rounded-sm border border-[#dedede] px-3 text-[14px] outline-none">
                      <option>Andaman and Nicobar Islands</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[14px] text-[#3b3b3b]">Zip/Postal Code</label>
                    <input className="h-11 w-full rounded-sm border border-[#dedede] px-3 text-[14px] outline-none" />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-5 h-12 rounded-full bg-black px-7 text-[13px] font-semibold tracking-[0.08em] text-white"
                >
                  CALCULATE SHIPPING
                </button>
              </section>
            </section>

            <aside className="h-fit rounded-md border border-[#e1e1e1] bg-[#efefef] p-6">
              <label className="block text-[14px] text-[#313131]">
                Special instructions for seller
              </label>
              <textarea className="mt-2 h-30 w-full resize-none rounded-sm border border-[#d9d9d9] bg-white p-3 text-[15px] outline-none" />

              <h3 className="mt-5 text-[24px] font-medium text-[#1f1f1f]">List Coupon</h3>
              <div className="mt-3 border-t border-[#d8d8d8] pt-3">
                <label className="block text-[14px] text-[#313131]">Coupon</label>
                <div className="mt-2 flex items-center gap-2">
                  <input className="h-12 flex-1 rounded-sm border border-[#d9d9d9] bg-white px-3 text-[15px] outline-none" />
                  <button
                    type="button"
                    className="h-12 rounded-full bg-black px-7 text-[14px] font-semibold tracking-[0.06em] text-white"
                  >
                    SAVE
                  </button>
                </div>
              </div>

              <div className="mt-5 border-t border-[#d8d8d8] pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[22px] text-[#2b2b2b]">Total</p>
                  <p className="text-[28px] font-semibold text-[#2b2b2b]">
                    {formatInr(subtotal)}
                  </p>
                </div>
                <p className="mt-1 text-[14px] text-[#535353]">
                  Tax included and shipping calculated at checkout
                </p>

                <Link
                  href="/checkout"
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-black text-[14px] font-semibold tracking-[0.08em] text-white"
                >
                  CHECK OUT
                </Link>

                <p className="mt-4 text-center text-[15px] text-[#4f4f4f]">We accept</p>
                <div className="mt-2 flex justify-center">
                  <Image
                    src="/assets/images/Secure_Payment.webp"
                    alt="Accepted payment methods"
                    width={200}
                    height={30}
                    className="h-auto w-auto"
                  />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <section className="mt-10 bg-white py-9">
        <div className="w-full px-2 sm:px-3 lg:px-4">
          <p className="text-[10px] font-medium tracking-[0.24em] text-[#b06d6d] uppercase">
            Recommend
          </p>
          <h2 className="mt-2 text-[38px] font-medium text-[#1f1f1f]">You May Also Like</h2>

          <div className="relative mt-5 px-4 sm:px-5">
            <Slider {...sliderSettings}>
              {recommendedProducts.map((product) => (
                <article key={product.id} className="px-1.5">
                  <div className="relative overflow-hidden rounded-sm bg-[#f3f3f3]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={260}
                      height={335}
                      className="h-[250px] w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-[14px] leading-tight text-[#202020]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-[14px] text-[#5a5a5a]">
                    {formatInr(product.priceInr)}
                  </p>
                </article>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      <section className="bg-[#efefef] px-4 py-12 text-center sm:px-6 sm:py-14">
        <h3 className="text-[30px] font-medium text-[#222] sm:text-[34px]">Important!</h3>
        <p className="mt-2 text-[34px] font-semibold leading-tight text-[#222] sm:text-[40px]">
          Record Parcel Opening Video
        </p>
        <p className="mx-auto mt-4 max-w-[980px] text-[16px] leading-[1.45] text-[#4a4a4a] sm:text-[18px]">
          We kindly request you to record a short video while unpacking your parcel.
          This helps us ensure the product reaches you in perfect condition.
        </p>
        <p className="mt-6 text-[30px] font-medium text-[#222] sm:text-[34px]">Thank you!</p>
      </section>

      <Footer />
    </main>
  );
}
