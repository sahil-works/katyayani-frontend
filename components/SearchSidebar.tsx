"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SearchSidebarContextValue = {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const SearchSidebarContext = createContext<SearchSidebarContextValue | null>(
  null,
);

export function useSearchSidebar() {
  const ctx = useContext(SearchSidebarContext);
  if (!ctx) {
    throw new Error("useSearchSidebar must be used within SearchSidebarProvider");
  }
  return ctx;
}

export function SearchSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  const value: SearchSidebarContextValue = {
    open,
    openSearch,
    closeSearch,
  };

  return (
    <SearchSidebarContext.Provider value={value}>
      {children}
    </SearchSidebarContext.Provider>
  );
}

function SearchInputIcon({ className }: { className?: string }) {
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function SearchSidebar() {
  const { open, closeSearch } = useSearchSidebar();
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeSearch]);

  return (
    <>
      <div
        role="presentation"
        aria-hidden={!open}
        className={`fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSearch}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`fixed inset-y-0 right-0 z-[101] flex w-full max-w-md flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-8 lg:px-8">
          <p
            id={titleId}
            className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#9a9a9a]"
          >
            What are you looking for?
          </p>
          <button
            type="button"
            onClick={closeSearch}
            className="-mr-1 -mt-1 cursor-pointer rounded-md p-2 text-[#2f2f2f] transition-colors hover:bg-[#f5f5f5] hover:text-black"
            aria-label="Close search"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          className="mt-5 px-6 lg:px-8"
          onSubmit={(event) => {
            event.preventDefault();
            const q = inputRef.current?.value.trim();
            if (!q) return;
            closeSearch();
            router.push(`/new-arrivals?q=${encodeURIComponent(q)}`);
          }}
        >
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <div className="relative flex items-end border-b border-[#e0e0e0] pb-2">
            <input
              ref={inputRef}
              id="product-search"
              type="search"
              name="q"
              placeholder="Search Products..."
              autoComplete="off"
              className="w-full min-w-0 border-0 bg-transparent pr-10 text-[18px] font-medium text-[#2f2f2f] placeholder:text-[#8a8a8a] outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="absolute right-0 bottom-1 grid h-8 w-8 place-items-center text-[#2f2f2f]"
              aria-label="Search products"
            >
              <SearchInputIcon className="h-6 w-6 shrink-0" />
            </button>
          </div>
        </form>

        <div className="mt-10 flex-1 overflow-y-auto px-6 pb-10 lg:px-8">
          {/* Results or trending searches can be rendered here */}
        </div>
      </div>
    </>
  );
}
