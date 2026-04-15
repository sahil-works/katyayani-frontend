import Link from "next/link";
import Image from "next/image";

const accountLinks = [
  { label: "Profile", href: "/account/profile" },
  { label: "Settings", href: "/account/settings" },
  { label: "My Orders", href: "/account/my-orders" },
];

const orders = [
  {
    id: "KYT-20431",
    date: "08 Apr 2026",
    item: "Mul Cotton Chanderi Elegant Suit Set",
    image: "/assets/images/banner-one.png",
    amount: "Rs. 5,250.00",
    status: "Delivered",
  },
  {
    id: "KYT-20398",
    date: "30 Mar 2026",
    item: "Crushed Tissue Unstitched Suits",
    image: "/assets/images/banner-two.png",
    amount: "Rs. 5,250.00",
    status: "Shipped",
  },
  {
    id: "KYT-20311",
    date: "22 Mar 2026",
    item: "Hand-Embroidered Kurta With Work",
    image: "/assets/images/banner-two.png",
    amount: "Rs. 5,250.00",
    status: "Processing",
  },
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

          <div className="mt-7 overflow-hidden rounded-xl border border-[#eceee0]">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-3 bg-[#f8f9f2] px-4 py-3 text-[13px] font-medium uppercase tracking-[0.04em] text-[#707070]">
              <p>Item</p>
              <p>Order ID</p>
              <p>Date</p>
              <p>Amount</p>
              <p>Status</p>
            </div>
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-3 border-t border-[#f0f1e6] px-4 py-4 text-[14px] text-[#2f2f2f]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={order.image}
                    alt={order.item}
                    width={44}
                    height={54}
                    className="h-[54px] w-[44px] rounded-md object-cover"
                  />
                  <p className="line-clamp-2">{order.item}</p>
                </div>
                <p className="font-medium">{order.id}</p>
                <p>{order.date}</p>
                <p className="font-medium text-[#5d6300]">{order.amount}</p>
                <p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
                      order.status === "Delivered"
                        ? "bg-[#e9f7eb] text-[#2e7d32]"
                        : order.status === "Shipped"
                          ? "bg-[#eef5ff] text-[#2d5fa8]"
                          : "bg-[#fff5e9] text-[#9a5f13]"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
