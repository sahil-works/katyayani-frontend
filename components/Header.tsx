"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { usePathname } from "next/navigation";
import { useCartSidebar } from "./CartSidebar";
import { useLoginModal } from "./LoginModal";
import { useSearchSidebar } from "./SearchSidebar";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const navItems = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "All collections", href: "/collections" },
  { label: "Contact us", href: "/contact-us" },
];

const catalogItems = [
  { label: "Silk suit", href: "/catalog/silk-suit" },
  { label: "Muslin suit", href: "/catalog/muslin-suit" },
  { label: "Pakistani suit", href: "/catalog/pakistani-suit" },
  { label: "Cotton Suit", href: "/catalog/cotton-suit" },
];

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
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

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { open: searchOpen, openSearch, closeSearch } = useSearchSidebar();
  const { open: cartOpen, openCart, closeCart, itemCount } = useCartSidebar();
  const { openLogin } = useLoginModal();

  if (pathname === "/checkout") {
    return null;
  }

  return (
    <header className="border-b border-[#f0f0f0] bg-white">
      <div className="mx-auto flex h-24 max-w-[1320px] items-center px-6 lg:px-10">
        <Link
          href="/"
          className={`${dancingScript.className} mr-10 text-[30px] font-bold leading-none tracking-[0.01em] text-[#9ea600]`}
        >
          Katyayani Designer Hub
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-10 text-[18px] text-[#2f2f2f] lg:flex">
          {navItems.map((item) => (
            item.label === "Catalog" ? (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[#2f2f2f] transition-colors hover:text-black"
                  aria-haspopup="menu"
                >
                  <span>{item.label}</span>
                  <ChevronDownIcon />
                </button>
                <div className="invisible absolute left-1/2 top-full z-20 mt-4 w-60 -translate-x-1/2 rounded-xl border border-[#e9e9e9] bg-white p-2 opacity-0 shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  {catalogItems.map((catalogItem) => (
                    <Link
                      key={catalogItem.label}
                      href={catalogItem.href}
                      className="group/link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[16px] text-[#343434] transition-colors hover:bg-[#f7f8ec] hover:text-[#9ea600]"
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-[#9ea600]"
                      />
                      <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 group-hover/link:after:scale-x-100">
                        {catalogItem.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="relative transition-colors hover:text-black after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-6 text-[#222]">
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            className="cursor-pointer"
            onClick={() => {
              closeCart();
              openSearch();
            }}
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            aria-label={`Shopping cart, ${itemCount} items`}
            aria-expanded={cartOpen}
            aria-haspopup="dialog"
            className="relative cursor-pointer"
            onClick={() => {
              closeSearch();
              openCart();
            }}
          >
            <CartIcon />
            <span
              className={`absolute -top-1 -right-1 grid min-h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold text-white ${
                itemCount > 0 ? "bg-[#9ea600]" : "bg-[#bfc49a]"
              }`}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          </button>

          <button
            type="button"
            aria-haspopup="dialog"
            className="h-13 rounded-none bg-[#9ea600] px-9 text-[19px] font-medium text-white ml-2 cursor-pointer transition-[filter] hover:brightness-105 active:brightness-95"
            onClick={() => {
              closeSearch();
              closeCart();
              openLogin();
            }}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
