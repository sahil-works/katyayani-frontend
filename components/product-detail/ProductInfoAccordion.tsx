import { FileText, Leaf, Lock, Plus, Truck } from "lucide-react";

type ProductInfoAccordionProps = {
  description: string;
  variant?: "full" | "sidebar";
};

const accordionItems = [
  {
    title: "Description",
    icon: FileText,
    body: null,
  },
  {
    title: "Free Shipping",
    icon: Truck,
    body: "Enjoy free shipping on all orders. Delivery is completed within 5–7 working days from the date of dispatch.",
  },
  {
    title: "Care Guide",
    icon: Leaf,
    body: "Follow the care instructions supplied with your order. Dry clean is recommended for delicate fabrics and embroidered pieces.",
  },
  {
    title: "Secure Payment",
    icon: Lock,
    body: "Checkout uses Razorpay payment preparation and backend payment status confirmation for order completion.",
  },
] as const;

export default function ProductInfoAccordion({
  description,
  variant = "full",
}: ProductInfoAccordionProps) {
  const isSidebar = variant === "sidebar";

  return (
    <section
      className={
        isSidebar
          ? "border-t border-[#e8e8e8]"
          : "rounded-[28px] border border-[#e8e4dc] bg-[#fbfaf6] px-5 py-2 sm:px-7"
      }
      aria-label="Product information"
    >
      {accordionItems.map(({ title, icon: Icon, body }, index) => (
        <details
          key={title}
          className={`group border-b border-[#e8e8e8] last:border-b-0 ${
            isSidebar ? "" : "border-[#e5dfd4]"
          }`}
          open={index === 0 && isSidebar}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 text-[14px] font-medium uppercase tracking-[0.08em] text-[#111] [&::-webkit-details-marker]:hidden sm:py-5">
            <span className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 ${isSidebar ? "text-[#666]" : "text-[#ea206d]"}`}
                strokeWidth={1.45}
                aria-hidden
              />
              {title}
            </span>
            <Plus
              className="h-4 w-4 shrink-0 text-[#666] transition-transform duration-200 group-open:rotate-45"
              strokeWidth={1.6}
              aria-hidden
            />
          </summary>
          <p className="pb-4 text-[14px] leading-7 text-[#666] sm:pb-5">
            {title === "Description"
              ? description || "Product details will be updated soon."
              : body}
          </p>
        </details>
      ))}
    </section>
  );
}
