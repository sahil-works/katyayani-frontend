import CatalogPageClient from "./CatalogPageClient";

type CatalogPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CatalogPageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${title} | Katyayani Designer Hub`,
    description: `Browse the ${title} catalog at Katyayani Designer Hub.`,
  };
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { slug } = await params;
  return <CatalogPageClient slug={slug} />;
}
