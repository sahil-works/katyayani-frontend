"use client";

import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCartSidebar } from "./CartSidebar";
import { useLoginModal } from "./LoginModal";
import { useSearchSidebar } from "./SearchSidebar";
import { useAuth } from "../providers/AuthProvider";
import { buildProductListingHref } from "../lib/storefront";
import { CategoryMenuLinks } from "./categories/CategoryNavLinks";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const navItems = [
  { label: "HOME", href: "/" },
  { label: "CATEGORY", href: "/" },
  { label: "WEDDING WEAR", href: buildProductListingHref({ tag: "wedding" }) },
  { label: "SUMMER WEAR", href: buildProductListingHref({ tag: "summer" }) },
  { label: "ALL COLLECTIONS", href: "/collections" },
  { label: "CONTACT US", href: "/contact-us" },
];

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
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

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5c1.8-3.2 4.1-4.5 6.5-4.5s4.7 1.3 6.5 4.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 8.5h11l-.7 11.2a1.5 1.5 0 0 1-1.5 1.4H8.7a1.5 1.5 0 0 1-1.5-1.4L6.5 8.5Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

function ChevronDownIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function IndiaFlagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 16"
      className="h-3.5 w-5 rounded-[1px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)] sm:h-4 sm:w-6"
    >
      <rect width="24" height="16" fill="#fff" />
      <rect width="24" height="5.33" y="0" fill="#FF9933" />
      <rect width="24" height="5.33" y="10.67" fill="#138808" />
      <circle cx="12" cy="8" r="2.1" fill="none" stroke="#000080" strokeWidth="0.7" />
      <circle cx="12" cy="8" r="0.45" fill="#000080" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const mobileNavTitleId = useId();
  const { open: searchOpen, openSearch, closeSearch } = useSearchSidebar();
  const { open: cartOpen, openCart, closeCart, itemCount } = useCartSidebar();
  const { openLogin } = useLoginModal();
  const { isAuthenticated, user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const desktopCategoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileMenuOpen(false);
    setCategoryMenuOpen(false);
    setMobileNavOpen(false);
    setMobileCategoriesOpen(false);
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

  useEffect(() => {
    if (!categoryMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!desktopCategoryRef.current?.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCategoryMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [categoryMenuOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileNavOpen]);

  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    return null;
  }

  const closeCategoryMenu = () => setCategoryMenuOpen(false);
  const closeMobileNav = () => {
    setMobileNavOpen(false);
    setMobileCategoriesOpen(false);
  };
  const toggleCategoryMenu = () => setCategoryMenuOpen((prev) => !prev);

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Announcement bar */}
      <div className="bg-[#ea206d] px-3 py-2 text-center text-[12px] font-medium tracking-[0.02em] text-white sm:px-4 sm:py-2.5 sm:text-[14px]">
        Discover Timeless Unstitched Elegance
      </div>

      {/* Logo / search / utilities */}
      <div className="border-b border-[#f0f0f0]">
        <div className="relative mx-auto grid h-16 max-w-[1320px] grid-cols-[auto_1fr_auto] items-center gap-1.5 px-3 sm:h-[72px] sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 lg:h-[88px] lg:px-10">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-drawer"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-[#2a2a2a] transition-colors hover:text-[#ea206d] lg:hidden"
              onClick={() => {
                closeSearch();
                closeCart();
                closeCategoryMenu();
                setProfileMenuOpen(false);
                setMobileNavOpen((prev) => !prev);
              }}
            >
              {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            <button
              type="button"
              aria-label="Search products"
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#6b6b6b] transition-colors hover:border-[#d0d0d0] sm:h-11 sm:w-auto sm:max-w-[240px] sm:justify-start sm:gap-2.5 sm:px-4 sm:text-left sm:text-[14px] sm:text-[#9a9a9a] lg:max-w-[260px]"
              onClick={() => {
                closeCart();
                closeCategoryMenu();
                closeMobileNav();
                openSearch();
              }}
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-[#6b6b6b]" />
              <span className="hidden truncate sm:inline">Search products</span>
            </button>
          </div>

          <Link
            href="/"
            className="flex min-w-0 flex-col items-center justify-self-center px-1 text-center sm:absolute sm:left-1/2 sm:top-1/2 sm:max-w-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:px-0"
            onClick={closeMobileNav}
          >
            <span
              className={`${dancingScript.className} max-w-[38vw] truncate text-[17px] font-bold leading-none tracking-[0.01em] text-[#ea206d] sm:max-w-none sm:text-[28px] lg:text-[30px]`}
            >
              Katyayani Designer Hub
            </span>
            <span className="mt-1 hidden text-[11px] font-normal tracking-[0.08em] text-[#8a8a8a] md:block">
              Affordable designer styles
            </span>
          </Link>

          <div className="flex items-center justify-end gap-0.5 text-[#2a2a2a] sm:col-start-3 sm:gap-2">
            <span
              className="hidden items-center sm:inline-flex sm:px-1"
              title="India"
              aria-label="India"
            >
              <IndiaFlagIcon />
            </span>

            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-[#ea206d]"
                  onClick={() => {
                    closeCategoryMenu();
                    closeMobileNav();
                    setProfileMenuOpen((prev) => !prev);
                  }}
                >
                  <UserIcon />
                </button>

                <div
                  className={`absolute right-0 top-full z-30 mt-2 w-[min(220px,calc(100vw-1.5rem))] rounded-2xl border border-[#eceee0] bg-white p-2 shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-all duration-200 sm:mt-3 ${
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
                    className="block rounded-xl px-3 py-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:bg-[#fdf0f5]"
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/settings"
                    className="block rounded-xl px-3 py-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:bg-[#fdf0f5]"
                    role="menuitem"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/account/my-orders"
                    className="block rounded-xl px-3 py-2.5 text-[15px] text-[#2f2f2f] transition-colors hover:bg-[#fdf0f5]"
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
                aria-label="Account"
                aria-haspopup="dialog"
                className="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-[#ea206d]"
                onClick={() => {
                  closeSearch();
                  closeCart();
                  closeCategoryMenu();
                  closeMobileNav();
                  openLogin();
                }}
              >
                <UserIcon />
              </button>
            )}

            <button
              type="button"
              aria-label={`Shopping cart, ${itemCount} items`}
              aria-expanded={cartOpen}
              aria-haspopup="dialog"
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-[#ea206d]"
              onClick={() => {
                closeSearch();
                closeCategoryMenu();
                closeMobileNav();
                openCart();
              }}
            >
              <BagIcon />
              <span
                className={`absolute top-1 right-0.5 grid min-h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-semibold text-white ${
                  itemCount > 0 ? "bg-[#ea206d]" : "bg-[#f0a0c0]"
                }`}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="hidden border-b border-[#f0f0f0] bg-[#fafafa] lg:block">
        <nav className="mx-auto flex max-w-[1320px] items-center justify-center gap-8 px-6 py-3.5 text-[15px] font-medium tracking-[0.06em] text-[#1a1a1a] uppercase lg:gap-10 lg:px-10 lg:text-[16px]">
          {navItems.map((item) =>
            item.label === "CATEGORY" ? (
              <div
                key={item.label}
                ref={desktopCategoryRef}
                className="relative"
                onMouseEnter={() => setCategoryMenuOpen(true)}
                onMouseLeave={() => setCategoryMenuOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-[#1a1a1a] transition-colors hover:text-[#ea206d]"
                  aria-haspopup="menu"
                  aria-expanded={categoryMenuOpen}
                  onClick={toggleCategoryMenu}
                >
                  <span>{item.label}</span>
                  <ChevronDownIcon open={categoryMenuOpen} />
                </button>
                <div
                  className={`absolute left-1/2 top-full z-20 w-60 -translate-x-1/2 pt-3 transition-all duration-200 normal-case tracking-normal ${
                    categoryMenuOpen
                      ? "pointer-events-auto visible translate-y-0 opacity-100"
                      : "pointer-events-none invisible -translate-y-1 opacity-0"
                  }`}
                  role="menu"
                >
                  <div className="rounded-xl border border-[#e9e9e9] bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.12)]">
                    <CategoryMenuLinks onNavigate={closeCategoryMenu} />
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-[#ea206d]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      {/* Mobile drawer overlay */}
      <div
        role="presentation"
        aria-hidden={!mobileNavOpen}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileNavOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileNav}
      />

      {/* Mobile navigation drawer */}
      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={mobileNavTitleId}
        aria-hidden={!mobileNavOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,340px)] max-w-full flex-col bg-white shadow-[8px_0_32px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-4">
          <p
            id={mobileNavTitleId}
            className={`${dancingScript.className} text-[22px] font-bold text-[#ea206d]`}
          >
            Menu
          </p>
          <button
            type="button"
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center text-[#2a2a2a] transition-colors hover:text-[#ea206d]"
            onClick={closeMobileNav}
          >
            <CloseIcon />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto overscroll-contain px-3 py-3"
          aria-label="Mobile primary"
        >
          {navItems.map((item) =>
            item.label === "CATEGORY" ? (
              <div key={item.label} className="border-b border-[#f3f3f3]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-3.5 text-left text-[14px] font-medium tracking-[0.05em] text-[#1a1a1a] uppercase"
                  aria-expanded={mobileCategoriesOpen}
                  onClick={() => setMobileCategoriesOpen((prev) => !prev)}
                >
                  <span>Category</span>
                  <ChevronDownIcon open={mobileCategoriesOpen} />
                </button>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
                    mobileCategoriesOpen
                      ? "max-h-[60vh] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pb-3 pl-1">
                    <CategoryMenuLinks
                      itemClassName="group/link flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] normal-case tracking-normal text-[#343434] transition-colors active:bg-[#fdf0f5] hover:bg-[#fdf0f5] hover:text-[#ea206d]"
                      onNavigate={closeMobileNav}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="block border-b border-[#f3f3f3] px-3 py-3.5 text-[14px] font-medium tracking-[0.05em] text-[#1a1a1a] uppercase transition-colors active:bg-[#fdf0f5] hover:text-[#ea206d]"
                onClick={closeMobileNav}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="border-t border-[#f0f0f0] px-4 py-4">
          <p className="text-[12px] tracking-[0.06em] text-[#8a8a8a] uppercase">
            Need help?
          </p>
          <Link
            href="/contact-us"
            className="mt-2 inline-flex text-[15px] font-medium text-[#ea206d]"
            onClick={closeMobileNav}
          >
            Contact us
          </Link>
        </div>
      </aside>
    </header>
  );
}
