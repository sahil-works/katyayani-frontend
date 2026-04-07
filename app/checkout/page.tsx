"use client";

import Image from "next/image";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useCartSidebar } from "../../components/CartSidebar";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 7h14l-1.5 8H8z" />
      <path d="M6 7 5 4H2" />
      <circle cx="9.5" cy="19" r="1.25" />
      <circle cx="17" cy="19" r="1.25" />
    </svg>
  );
}

function CheckoutHeader() {
  const { itemCount, openCart } = useCartSidebar();

  return (
    <header className="border-b border-[#ebebeb] bg-white">
      <div className="mx-auto flex h-[74px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={`${dancingScript.className} text-[30px] font-bold leading-none tracking-[0.01em] text-[#9ea600]`}
        >
          Katyayani Designer Hub
        </Link>
        <button
          type="button"
          onClick={openCart}
          aria-label={`Shopping cart, ${itemCount} items`}
          className="relative text-[#2f2f2f]"
        >
          <CartIcon />
          <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-black px-1 text-center text-[10px] font-semibold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        </button>
      </div>
    </header>
  );
}

export default function CheckoutPage() {
  const { lines, subtotal, itemCount } = useCartSidebar();
  const total = subtotal;

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      <CheckoutHeader />

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="bg-white px-4 py-7 sm:px-6 lg:pr-10">
          <h1 className="sr-only">Checkout</h1>

          <div>
            <div className="mb-2 flex items-end justify-between">
              <h2 className="text-[29px] font-semibold text-[#1f1f1f]">Contact</h2>
              <button
                type="button"
                className="text-[14px] font-medium text-[#1f5f9e] hover:underline"
              >
                Sign in
              </button>
            </div>
            <input
              type="text"
              placeholder="Email or mobile phone number"
              className="h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none placeholder:text-[#9d9d9d] focus:border-[#999]"
            />
            <label className="mt-3 flex items-center gap-2 text-[14px] text-[#3d3d3d]">
              <input type="checkbox" className="h-4 w-4" />
              Email me with news and offers
            </label>
          </div>

          <div className="mt-7">
            <h2 className="mb-3 text-[29px] font-semibold text-[#1f1f1f]">Delivery</h2>

            <select className="h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none">
              <option>India</option>
            </select>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="First name (optional)"
                className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
              />
              <input
                type="text"
                placeholder="Last name"
                className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="Address"
              className="mt-3 h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
            />
            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              className="mt-3 h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
            />

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_1fr]">
              <input
                type="text"
                placeholder="City"
                className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
              />
              <select className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none">
                <option>Haryana</option>
              </select>
              <input
                type="text"
                placeholder="PIN code"
                className="h-12 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="Phone"
              className="mt-3 h-12 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
            />

            <label className="mt-3 flex items-center gap-2 text-[14px] text-[#3d3d3d]">
              <input type="checkbox" className="h-4 w-4" />
              Save this information for next time
            </label>
          </div>

          <div className="mt-7">
            <h3 className="mb-2 text-[23px] font-semibold text-[#1f1f1f]">Shipping method</h3>
            <div className="rounded-md border border-[#e2e2e2] bg-[#f8f8f8] px-4 py-4 text-center text-[14px] text-[#7a7a7a]">
              Enter your shipping address to view available shipping methods.
            </div>
          </div>

          <div className="mt-7">
            <h3 className="text-[23px] font-semibold text-[#1f1f1f]">Payment</h3>
            <p className="mt-1 text-[14px] text-[#666]">
              All transactions are secure and encrypted.
            </p>

            <div className="mt-3 overflow-hidden rounded-md border border-[#d8d8d8] bg-white">
              <label className="flex items-center justify-between border-b border-[#e8e8e8] bg-[#f5f8ff] px-3 py-3 text-[14px]">
                <span className="flex items-center gap-2">
                  <input type="radio" name="payment" defaultChecked />
                  Credit card
                </span>
                <span className="text-[12px] text-[#666]">VISA / AMEX</span>
              </label>

              <div className="space-y-3 p-3">
                <input
                  type="text"
                  placeholder="Card number"
                  className="h-11 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Expiration date (MM / YY)"
                    className="h-11 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Security code"
                    className="h-11 rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Name on card"
                  className="h-11 w-full rounded-md border border-[#dbdbdb] px-3 text-[14px] outline-none"
                />
                <label className="flex items-center gap-2 text-[14px] text-[#3d3d3d]">
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  Use shipping address as billing address
                </label>
              </div>

              <label className="flex items-center justify-between border-t border-[#e8e8e8] px-3 py-3 text-[14px]">
                <span className="flex items-center gap-2">
                  <input type="radio" name="payment" />
                  Razorpay Secure (UPI, Cards, Int&apos;l Cards, Wallets)
                </span>
                <span className="text-[12px] text-[#666]">UPI / VISA / +18</span>
              </label>

              <label className="flex items-center gap-2 border-t border-[#e8e8e8] px-3 py-3 text-[14px]">
                <input type="radio" name="payment" />
                Cash on Delivery (COD)
              </label>
            </div>

            <button
              type="button"
              className="mt-4 h-12 w-full rounded-md bg-[#0070f3] text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Pay now
            </button>
          </div>
        </section>

        <aside className="border-t border-[#e8e8e8] bg-[#f5f5f5] px-4 py-7 sm:px-6 lg:border-l lg:border-t-0">
          {lines.length === 0 ? (
            <div className="rounded-md border border-[#dddddd] bg-white p-5">
              <p className="text-[15px] text-[#333]">Your cart is empty.</p>
              <Link
                href="/collections"
                className="mt-3 inline-block text-[14px] font-medium text-[#1f5f9e] hover:underline"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-3">
                    <div className="relative h-[64px] w-[64px] overflow-hidden rounded-md border border-[#ddd] bg-white">
                      <Image
                        src={line.imageSrc}
                        alt={line.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#5f5f5f] px-1 text-[11px] font-semibold text-white">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#232323]">
                        {line.name}
                      </p>
                      {line.subtitle ? (
                        <p className="truncate text-[13px] text-[#707070]">{line.subtitle}</p>
                      ) : null}
                    </div>
                    <p className="text-[14px] font-medium text-[#222]">
                      {formatInr(line.unitPrice * line.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-7 space-y-2 border-t border-[#dddddd] pt-4">
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatInr(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[14px] text-[#444]">
                  <span>Shipping</span>
                  <span>Enter shipping address</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#dddddd] pt-3 text-[24px] font-semibold text-[#202020]">
                  <span>Total</span>
                  <span>{formatInr(total)}</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
