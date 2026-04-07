import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  FileText,
  Flame,
  Leaf,
  Lock,
  Plus,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";
import Footer from "../../../components/Footer";
import ProductDetailPostPurchaseSection from "../../../components/ProductDetailPostPurchaseSection";
import ProductDetailGallery from "../../../components/ProductDetailGallery";
import ProductPurchaseBar from "../../../components/ProductPurchaseBar";
import SilkCollectionSection from "../../../components/SilkCollectionSection";
import {
  getAllProductSlugs,
  getProductBySlug,
  getYouMayAlsoLikeProducts,
} from "../../../lib/productDetail";
import YouMayAlsoLikeSection from "../../../components/YouMayAlsoLikeSection";
import ShopLatestCollectionSection from "@/components/ShopLatestCollectionSection";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatRs(value: number) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return formatted.replace("₹", "Rs. ");
}

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product | Katyayani Designer Hub" };
  }
  return {
    title: `${product.name} | Katyayani Designer Hub`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const youMayAlsoLike = getYouMayAlsoLikeProducts(slug, 4).map((p) => {
    const lead = p.images[0];
    return {
      slug: p.slug,
      name: p.name,
      priceLabel: formatRs(p.priceInr),
      imageSrc: lead?.src ?? "/assets/images/banner-one.png",
      imageAlt: lead?.alt ?? p.name,
    };
  });

  return (
    <main className="min-h-[calc(100vh-96px)] bg-white text-[#111]">
      <div className="mx-auto max-w-[1320px] px-6 pt-5 pb-16 lg:px-10">
        <nav className="text-[14px] text-[#5c5c5c]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          <Link href={product.collectionHref} className="hover:text-black">
            {product.collectionLabel}
          </Link>
          <span className="mx-2 text-[#9c9c9c]">/</span>
          <span className="text-[#2f2f2f]">{product.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
          <ProductDetailGallery
            images={product.images}
            productName={product.name}
          />

          <div className="min-w-0 space-y-6 lg:pt-1">
            <div>
              <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#111] sm:text-[34px] sm:leading-[1.2]">
                {product.name}
              </h1>
              <p className="mt-3 text-[22px] font-semibold text-[#111] sm:text-[24px]">
                {formatRs(product.priceInr)}
              </p>
            </div>

            <ProductPurchaseBar product={product} />

            <div className="space-y-1 text-[15px] text-[#444]">
              <p>
                <span className="text-[#888]">Sku:</span>{" "}
                <span className="text-[#111]">{product.sku}</span>
              </p>
              <p>
                <span className="text-[#888]">Available:</span>{" "}
                <span
                  className={
                    product.inStock ? "font-medium text-emerald-600" : "font-medium text-red-600"
                  }
                >
                  {product.inStock ? "Available" : "Out of stock"}
                </span>
              </p>
            </div>

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
                  {product.description}
                </p>
              </details>

              <details className="group border-b border-[#e8e8e8]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-medium text-[#111] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-[#444]" strokeWidth={1.6} aria-hidden />
                    Free Shipping
                  </span>
                  <Plus
                    className="h-5 w-5 shrink-0 text-[#111] transition-transform group-open:rotate-45"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </summary>
                <p className="pb-4 text-[15px] leading-relaxed text-[#555]">
                  {product.freeShippingNote}
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
                  {product.careGuide}
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
                  Your checkout is protected with industry-standard encryption. We partner
                  with Razorpay so your card and UPI details stay secure. See the guarantee
                  and accepted methods below.
                </p>
              </details>
            </div>

            <div className="space-y-1  pt-0 text-[16px] font-medium text-[#111]">
              <p className="flex items-center gap-2 py-3">
                <Eye
                  className="h-5 w-5 shrink-0 text-[#444]"
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span>20 customers are viewing this product</span>
              </p>
              <p className="flex items-center gap-2 py-3 font-medium text-red-600">
                <Flame
                  className="h-5 w-5 shrink-0 text-red-600"
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span>30 SOLD IN LAST 18 HOURS</span>
              </p>
            </div>

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
                alt="Guarantee safe checkout — 100% secure payment with Razorpay, Visa, UPI, RuPay, Maestro, Diners Club, Mastercard, and American Express"
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

      <YouMayAlsoLikeSection items={youMayAlsoLike} />

      <SilkCollectionSection />
      <ShopLatestCollectionSection />
      <Footer />
    </main>
  );
}
