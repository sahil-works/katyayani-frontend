import { buildProductListingHref } from "../lib/storefront";
import HomeProductSection from "./HomeProductSection";

export default function ShopLatestCollectionSection() {
  return (
    <HomeProductSection
      title="Shop Latest Collection"
      description="A curated selection of products tagged for the latest collection."
      params={{ limit: 4, tag: "latest" }}
      emptyTitle="No latest products found"
      emptyDescription="Latest collection products will appear here once they are tagged."
      viewAllHref={buildProductListingHref({ tag: "latest" })}
    />
  );
}
