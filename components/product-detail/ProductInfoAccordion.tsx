import { FileText, Leaf, Lock, Plus, Truck } from "lucide-react";

type ProductInfoAccordionProps = {
  description: string;
};

const accordionItems = [
  {
    title: "Description",
    icon: FileText,
    body: null,
  },
  {
    title: "Shipping",
    icon: Truck,
    body: "Shipping options and charges are calculated during checkout.",
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
}: ProductInfoAccordionProps) {
  return (
    <section
      className="rounded-[28px] border border-[#e8e4dc] bg-[#fbfaf6] px-5 py-2 sm:px-7"
      aria-label="Product information"
    >
      {accordionItems.map(({ title, icon: Icon, body }, index) => (
        <details
          key={title}
          className="group border-b border-[#e5dfd4] last:border-b-0"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[15px] font-medium uppercase tracking-[0.12em] text-[#1f1b16] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-3">
              <Icon
                className="h-4.5 w-4.5 shrink-0 text-[#9ea600]"
                strokeWidth={1.45}
                aria-hidden
              />
              {title}
            </span>
            <Plus
              className="h-4.5 w-4.5 shrink-0 text-[#4b473f] transition-transform duration-200 group-open:rotate-45"
              strokeWidth={1.6}
              aria-hidden
            />
          </summary>
          <p className="max-w-3xl pb-5 text-[15px] leading-7 text-[#625d54]">
            {title === "Description"
              ? description || "Product details will be updated soon."
              : body}
          </p>
        </details>
      ))}
    </section>
  );
}
