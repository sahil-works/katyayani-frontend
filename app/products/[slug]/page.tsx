import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileText, Leaf, Lock, Plus, Truck } from "lucide-react";
import { cache } from "react";
import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";
import ProductDetailInteractive from "../../../components/ProductDetailInteractive";
import ProductDetailPostPurchaseSection from "../../../components/ProductDetailPostPurchaseSection";
import ShopLatestCollectionSection from "../../../components/ShopLatestCollectionSection";
import SilkCollectionSection from "../../../components/SilkCollectionSection";
import { getProductBySlug } from "../../../lib/api";
import { normalizeApiError } from "../../../lib/api/errors";

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

function ProductDetailsAccordion({
  description,
}: {
  description: string;
}) {
  return (
    <div className="border-t border-[#e8e8e8]">
      <details className="group border-b border-[#e8e8e8]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-[#111] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <FileText
              className="h-5 w-5 shrink-0 text-[#444]"
              strokeWidth={1.6}
              aria-hidden
            />
            Description
          </span>
          <Plus
            className="h-5 w-5 shrink-0 text-[#111] transition-transform group-open:rotate-45"
            strokeWidth={1.8}
            aria-hidden
          />
        </summary>
        <p className="pb-4 text-[15px] leading-relaxed text-[#555]">
          {description || "Product details will be updated soon."}
        </p>
      </details>

      <details className="group border-b border-[#e8e8e8]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-[#111] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#444]" strokeWidth={1.6} aria-hidden />
            Shipping
          </span>
          <Plus
            className="h-5 w-5 shrink-0 text-[#111] transition-transform group-open:rotate-45"
            strokeWidth={1.8}
            aria-hidden
          />
        </summary>
        <p className="pb-4 text-[15px] leading-relaxed text-[#555]">
          Shipping options and charges are calculated during checkout.
        </p>
      </details>

      <details className="group border-b border-[#e8e8e8]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-[#111] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-[#444]" strokeWidth={1.6} aria-hidden />
            Care Guide
          </span>
          <Plus
            className="h-5 w-5 shrink-0 text-[#111] transition-transform group-open:rotate-45"
            strokeWidth={1.8}
            aria-hidden
          />
        </summary>
        <p className="pb-4 text-[15px] leading-relaxed text-[#555]">
          Follow the care instructions supplied with your order. Dry clean is
          recommended for delicate fabrics and embroidered pieces.
        </p>
      </details>

      <details className="group border-b border-[#e8e8e8]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-[#111] [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Lock className="h-5 w-5 shrink-0 text-[#444]" strokeWidth={1.6} aria-hidden />
            Secure payment
          </span>
          <Plus
            className="h-5 w-5 shrink-0 text-[#111] transition-transform group-open:rotate-45"
            strokeWidth={1.8}
            aria-hidden
          />
        </summary>
        <p className="pb-4 text-[15px] leading-relaxed text-[#555]">
          Payment integration will be completed in the checkout phase using the
          stabilized commerce contract.
        </p>
      </details>
    </div>
  );
}

function RelatedProductsPlaceholder() {
  return (
    <section className="bg-white py-14 sm:py-16" aria-labelledby="related-products-heading">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10">
        <div className="text-center">
          <h2
            id="related-products-heading"
            className="mx-auto max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[32px] font-medium leading-none text-[#111] sm:text-[40px] lg:text-[43px]"
          >
            You May Also Like
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[#666]">
            Related products will be powered by the storefront recommendation
            contract in a later phase.
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await readActiveProduct(slug);

  return (
    <main className="min-h-[calc(100vh-96px)] bg-white text-[#111]">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 pb-16 lg:px-10">
        <nav className="text-[14px] text-[#5c5c5c]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          {product.category ? (
            <>
              <Link
                href={`/new-arrivals?categoryId=${encodeURIComponent(product.category.id)}`}
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

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="hidden lg:block" aria-hidden />
          <div className="space-y-6">
            <ProductDetailsAccordion description={product.description} />

            <div className="pt-0">
              <div className="mb-4 flex items-center gap-3 sm:gap-4">
                <span
                  className="h-px min-w-0 flex-1 bg-[#c8c8c8]"
                  aria-hidden
                />
                <h2 className="shrink-0 text-center text-[15px] font-medium tracking-tight text-black sm:text-[16px]">
                  Guarantee Safe Checkout
                </h2>
                <span
                  className="h-px min-w-0 flex-1 bg-[#c8c8c8]"
                  aria-hidden
                />
              </div>
              <Image
                src="/assets/images/Secure_Payment.webp"
                alt="Guarantee safe checkout with secure payment methods"
                width={1100}
                height={360}
                className="w-full h-auto rounded-xl border border-[#e0e4ec]"
                sizes="(min-width: 1024px) min(640px, 50vw), 100vw"
              />
            </div>
          </div>
        </div>
      </div>

      <ProductDetailPostPurchaseSection />
      <RelatedProductsPlaceholder />
      <SilkCollectionSection />
      <ShopLatestCollectionSection />
      <Footer />
    </main>
  );
}
