import { buildProductListingHref } from "../lib/storefront";
import HomeProductSection from "./HomeProductSection";

export default function NewArrivalsSection() {
  return (
    <HomeProductSection
      title="New Arrivals"
      eyebrow="Be the first to try our new collection"
      description="New season, new vibes, new arrivals because you deserve the freshest picks."
      params={{ limit: 8, sort: "newest" }}
      className="bg-[#f1f1f1] py-14"
      skeletonRows={8}
      emptyTitle="No new arrivals yet"
      emptyDescription="Fresh products will appear here as soon as they are published."
      viewAllHref={buildProductListingHref({})}
    />
  );
}
