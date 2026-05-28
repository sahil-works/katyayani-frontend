import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";
import ProductDetailInteractive from "../../../components/ProductDetailInteractive";
import ProductInfoAccordion from "../../../components/product-detail/ProductInfoAccordion";
import ProductDetailPostPurchaseSection from "../../../components/ProductDetailPostPurchaseSection";
import RelatedProductsSection from "../../../components/product-detail/RelatedProductsSection";
import { getProductBySlug } from "../../../lib/api";
import { normalizeApiError } from "../../../lib/api/errors";
import { buildProductListingHref } from "../../../lib/storefront";

type Props = {
  params: Promise<{ slug?: string }>;
};

export const dynamic = "force-dynamic";

const getProduct = cache(async (slug: string) => getProductBySlug(slug));

async function readActiveProduct(slug: string | undefined) {
  if (!slug) {
    notFound();
  }

  try {
    const product = await getProduct(slug);

    if (!product.isActive) {
      notFound();
    }

    return product;
  } catch (error) {
    const apiError = normalizeApiError(error);

    if (apiError.status === 404) {
      notFound();
    }

    throw apiError;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await readActiveProduct(slug);
  const title = product.seo.title;
  const description = product.seo.description;
  const image = product.image;

  return {
    title,
    description,
    alternates: {
      canonical: product.href,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: product.href,
      images: [
        {
          url: image.src,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.src],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await readActiveProduct(slug);

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#fffdf9] text-[#111]">
      <div className="mx-auto max-w-[1480px] px-4 pt-5 pb-14 sm:px-6 lg:px-10">
        <nav className="text-[14px] text-[#5c5c5c]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          {product.category ? (
            <>
              <Link
                href={buildProductListingHref({ categoryId: product.category.id })}
                className="hover:text-black"
              >
                {product.category.title}
              </Link>
              <span className="mx-2 text-[#9c9c9c]">/</span>
            </>
          ) : null}
          <span className="text-[#2f2f2f]">{product.title}</span>
        </nav>

        <ProductDetailInteractive product={product} />

        <div className="mt-10 lg:mt-14">
          <ProductInfoAccordion description={product.description} />
        </div>
      </div>

      <ProductDetailPostPurchaseSection />
      <RelatedProductsSection
        currentProductId={product.id}
        currentProductSlug={product.slug}
        categoryId={product.category?.id}
      />
      <Footer />
    </main>
  );
}
