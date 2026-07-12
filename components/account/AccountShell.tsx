"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useLoginModal } from "../LoginModal";
import { useAuth } from "../../providers/AuthProvider";

const accountLinks = [
  { label: "Profile", href: "/account/profile" },
  { label: "My Orders", href: "/account/my-orders" },
  { label: "Settings", href: "/account/settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/account/my-orders") {
    return pathname.startsWith("/account/my-orders");
  }
  return pathname === href;
}

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, isAuthenticated, user, logout } = useAuth();
  const { openLogin } = useLoginModal();

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f6f7f2] py-10">
      <div className="mx-auto grid w-full max-w-[1320px] gap-6 px-6 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="h-fit rounded-2xl border border-[#e6e8d9] bg-white p-4">
          <div className="flex items-center gap-3 px-2 pb-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#eef1dc] text-[16px] font-semibold text-[#6f7600]">
              {isAuthenticated && user ? user.initials : "KH"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-[#1f1f1f]">
                {isAuthenticated && user ? user.name : "My Account"}
              </p>
              {isAuthenticated && user?.phone ? (
                <p className="truncate text-[13px] text-[#7b7b7b]">
                  +{user.phone}
                </p>
              ) : (
                <p className="text-[13px] text-[#7b7b7b]">Guest</p>
              )}
            </div>
          </div>

          <nav className="mt-1 space-y-1 border-t border-[#eceee0] pt-3">
            {accountLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
                  isActive(pathname, item.href)
                    ? "bg-[#f1f3e3] font-medium text-[#6f7600]"
                    : "text-[#333] hover:bg-[#f8f9f0]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-[15px] text-[#a24a4a] transition-colors hover:bg-[#fbeeee]"
              >
                Log out
              </button>
            ) : null}
          </nav>
        </aside>

        {status === "initializing" ? (
          <section className="rounded-2xl border border-[#e6e8d9] bg-white p-6 sm:p-8">
            <div className="h-6 w-40 animate-pulse rounded-full bg-[#eceee0]" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-[#f3f4ea]"
                />
              ))}
            </div>
          </section>
        ) : !isAuthenticated ? (
          <section className="flex flex-col items-start justify-center rounded-2xl border border-[#e6e8d9] bg-white p-8 sm:p-10">
            <h2 className="text-[24px] font-semibold text-[#1f1f1f]">
              Sign in to your account
            </h2>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#666]">
              View your orders, manage your profile, and check out faster. We
              will send a one-time password to your mobile number.
            </p>
            <button
              type="button"
              onClick={() => openLogin({ reason: "account" })}
              className="mt-6 cursor-pointer rounded-xl bg-[#9ea600] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#8f9500]"
            >
              Sign in with mobile
            </button>
          </section>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
