import Link from "next/link";

const accountLinks = [
  { label: "Profile", href: "/account/profile" },
  { label: "Settings", href: "/account/settings" },
  { label: "My Orders", href: "/account/my-orders" },
];

export default function AccountProfilePage() {
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
                  item.href === "/account/profile"
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
            Account overview
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-none text-[#1f1f1f]">Profile</h1>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
              <p className="text-[13px] text-[#777]">Full name</p>
              <p className="mt-1 text-[18px] font-medium text-[#222]">Katyayani Shopper</p>
            </div>
            <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
              <p className="text-[13px] text-[#777]">Email</p>
              <p className="mt-1 text-[18px] font-medium text-[#222]">shopper@katyayani.com</p>
            </div>
            <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
              <p className="text-[13px] text-[#777]">Phone</p>
              <p className="mt-1 text-[18px] font-medium text-[#222]">+91 98765 43210</p>
            </div>
            <div className="rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4">
              <p className="text-[13px] text-[#777]">Default address</p>
              <p className="mt-1 text-[18px] font-medium text-[#222]">New Delhi, India</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-[#9ea600] px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#8f9500]"
            >
              Edit profile
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-[#dadcc8] px-5 py-2.5 text-[15px] font-medium text-[#333] transition-colors hover:bg-[#f8f9f0]"
            >
              Manage addresses
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
