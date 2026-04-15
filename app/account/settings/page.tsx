import Link from "next/link";

const accountLinks = [
  { label: "Profile", href: "/account/profile" },
  { label: "Settings", href: "/account/settings" },
  { label: "My Orders", href: "/account/my-orders" },
];

const settingItems = [
  { title: "Email updates", description: "Offers, drops, and order notifications", enabled: true },
  { title: "WhatsApp updates", description: "Delivery and order status on WhatsApp", enabled: true },
  { title: "Two-step verification", description: "Add extra security to your account", enabled: false },
  { title: "Save cards securely", description: "Use saved cards for faster checkout", enabled: false },
];

export default function AccountSettingsPage() {
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
                  item.href === "/account/settings"
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
            Preferences
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-none text-[#1f1f1f]">Settings</h1>

          <div className="mt-7 space-y-3">
            {settingItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#eceee0] bg-[#fbfcf8] p-4"
              >
                <div>
                  <p className="text-[17px] font-medium text-[#222]">{item.title}</p>
                  <p className="mt-1 text-[14px] text-[#6a6a6a]">{item.description}</p>
                </div>
                <button
                  type="button"
                  className={`h-7 w-13 cursor-pointer rounded-full p-1 transition-colors ${
                    item.enabled ? "bg-[#9ea600]" : "bg-[#d8dac9]"
                  }`}
                  aria-pressed={item.enabled}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                      item.enabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
