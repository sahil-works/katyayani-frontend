import Link from "next/link";

const accountLinks = [
  { label: "Profile", href: "/account/profile" },
  { label: "Settings", href: "/account/settings" },
  { label: "My Orders", href: "/account/my-orders" },
];

export default function AccountOrdersPage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f6f7f2] py-10">
      <div className="mx-auto grid w-full max-w-[1320px] gap-6 px-6 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="rounded-2xl border border-[#e6e8d9] bg-white p-4">
          <h2 className="px-3 text-[18px] font-semibold text-[#1f1f1f]">My Account</h2>
          <nav className="mt-3 space-y-1">
            {accountLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-[15px] transition-colors ${
                  item.href === "/account/my-orders"
                    ? "bg-[#f1f3e3] font-medium text-[#6f7600]"
                    : "text-[#333] hover:bg-[#f8f9f0]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="rounded-2xl border border-[#e6e8d9] bg-white p-6 sm:p-8">
          <p className="text-[13px] font-medium tracking-[0.06em] text-[#7b7b7b] uppercase">
            Purchases
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-none text-[#1f1f1f]">My Orders</h1>

          <div className="mt-7 rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-6">
            <h2 className="text-[20px] font-semibold text-[#222]">
              Order history is coming soon
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#666]">
              Live customer order rendering will be connected after the order
              history contract is stabilized. This page no longer shows demo
              product rows or static product images.
            </p>
            <Link
              href="/collections"
              className="mt-5 inline-flex rounded-md bg-[#9ea600] px-5 py-3 text-[14px] font-semibold text-white"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
