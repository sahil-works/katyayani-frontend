"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartSidebar } from "./CartSidebar";
import { useLoginModal } from "./LoginModal";
import { useSearchSidebar } from "./SearchSidebar";
import { useAuth } from "../providers/AuthProvider";
import { CatalogMenuLinks } from "./catalog/CatalogNavLinks";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const navItems = [
  { label: "Home", href: "/" },
  { label: "Category", href: "/" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "All collections", href: "/collections" },
  { label: "Contact us", href: "/contact-us" },
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
  const router = useRouter();
  const { open: searchOpen, openSearch, closeSearch } = useSearchSidebar();
  const { open: cartOpen, openCart, closeCart, itemCount } = useCartSidebar();
  const { openLogin } = useLoginModal();
  const { isAuthenticated, user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileMenuOpen]);

  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
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
          {navItems.map((item) =>
            item.label === "Category" ? (
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
                  <CatalogMenuLinks />
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
            ),
          )}
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

          {isAuthenticated && user ? (
            <div className="relative ml-2" ref={profileMenuRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                className="flex cursor-pointer items-center gap-3 rounded-full border border-[#e5e7d9] bg-[#f9faef] px-3 py-1.5 text-[#2a2a2a] transition-colors hover:bg-[#f1f3de]"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#9ea600] text-sm font-semibold text-white">
                  {user.initials}
                </span>
                <span className="hidden max-w-[120px] truncate text-[15px] font-medium lg:block">
                  {user.name}
                </span>
              </button>

              <div
                className={`absolute right-0 top-full z-30 mt-3 w-[220px] rounded-2xl border border-[#eceee0] bg-white p-2 shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all duration-200 ${
                  profileMenuOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
                role="menu"
              >
                <div className="mb-1 border-b border-[#f1f1ea] px-3 pb-2 pt-1">
                  <p className="text-[13px] text-[#6b6b6b]">Signed in as</p>
                  <p className="truncate text-[14px] font-medium text-[#222]">
                    {user.email}
                  </p>
                </div>
                <Link
                  href="/account/profile"
                  className="block rounded-xl px-3 py-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:bg-[#f7f8ec]"
                  role="menuitem"
                >
                  Profile
                </Link>
                <Link
                  href="/account/settings"
                  className="block rounded-xl px-3 py-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:bg-[#f7f8ec]"
                  role="menuitem"
                >
                  Settings
                </Link>
                <Link
                  href="/account/my-orders"
                  className="block rounded-xl px-3 py-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:bg-[#f7f8ec]"
                  role="menuitem"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  className="mt-1 block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[15px] text-[#c14747] transition-colors hover:bg-[#fff2f2]"
                  role="menuitem"
                  onClick={async () => {
                    await logout();
                    setProfileMenuOpen(false);
                    router.push("/");
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
