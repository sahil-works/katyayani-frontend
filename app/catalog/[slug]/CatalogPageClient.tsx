"use client";

import { Suspense } from "react";
import CatalogPageContent from "../../../components/catalog/CatalogPageContent";

type CatalogPageProps = {
  slug: string;
};

function CatalogPageInner({ slug }: CatalogPageProps) {
  return <CatalogPageContent slug={slug} />;
}

export default function CatalogPageClient({ slug }: CatalogPageProps) {
  return (
    <Suspense fallback={<div className="px-6 py-20 text-center text-[#666]">Loading catalog…</div>}>
      <CatalogPageInner slug={slug} />
    </Suspense>
  );
}
