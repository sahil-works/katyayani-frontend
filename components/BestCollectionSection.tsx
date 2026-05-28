import { buildProductListingHref } from "../lib/storefront";
import HomeProductSection from "./HomeProductSection";

export default function BestCollectionSection() {
  return (
    <HomeProductSection
      title="Katyayani's Best Collection"
      description="Editor-picked favorites from the featured storefront collection."
      params={{ limit: 8, tag: "featured" }}
      className="bg-[#eeeee8] py-16"
      emptyTitle="No featured products found"
      emptyDescription="Featured catalog products will appear here once they are tagged."
      viewAllHref={buildProductListingHref({ tag: "featured" })}
    />
  );
}
