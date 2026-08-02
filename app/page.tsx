import HeroBanner from "../components/HeroBanner";
import BestCollectionSection from "../components/BestCollectionSection";
import NewArrivalsSection from "../components/NewArrivalsSection";
import ShopByCategoriesSection from "../components/ShopByCategoriesSection";
import ShopLatestCollectionSection from "../components/ShopLatestCollectionSection";
import StoreLocationsSection from "../components/StoreLocationsSection";
import Footer from "../components/Footer";
import AnimateOnView from "../components/AnimateOnView";
import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const serviceHighlights = [
  { label: "No Return & Exchange", icon: RotateCcw },
  { label: "Free Shipping", icon: Truck },
  { label: "100% Secure Payment", icon: ShieldCheck },
  { label: "24/7 Customers Support", icon: Headset },
];

const liveShoppingBannerImage = "/assets/images/sets.png";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-white">
      <HeroBanner />
      <section className="border-y border-[#e7e7e7] bg-[#f6f6f6]">
        <div className="mx-auto grid min-h-[86px] max-w-[1320px] grid-cols-1 divide-y divide-[#e7e7e7] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {serviceHighlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <AnimateOnView
                key={item.label}
                animation="fadeInUp"
                delay={index * 100}
                duration={0.65}
                className="flex items-center justify-center gap-3 px-4 py-4 text-[#151515]"
              >
                <span className="grid h-15 w-15 place-items-center rounded-full border border-[#d1d1d1] bg-white">
                  <Icon className="h-[28px] w-[28px] stroke-[1.75]" />
                </span>
                <p className="text-[19px] leading-none font-medium">
                  {item.label}
                </p>
              </AnimateOnView>
            );
          })}
        </div>
      </section>
      <NewArrivalsSection />
      <ShopByCategoriesSection />

      <section className="bg-white">
        <div
          className="live-shopping-banner relative py-16 mx-auto flex w-full items-center justify-center overflow-hidden px-6 text-center text-white sm:px-10"
          style={{
            backgroundImage: `url(${liveShoppingBannerImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label="Live video shopping banner"
        >
          <div className="absolute inset-0 bg-black/45" />

          <div className="pointer-events-none absolute left-[15%] top-1/2 hidden h-[240px] w-[44px] -translate-y-1/2 md:block">
            <span className="absolute left-0 top-0 h-[3px] w-full bg-white" />
            <span className="absolute left-0 top-0 h-full w-[3px] bg-white" />
            <span className="absolute left-0 bottom-0 h-[3px] w-full bg-white" />
          </div>

          <div className="pointer-events-none absolute right-[15%] top-1/2 hidden h-[240px] w-[44px] -translate-y-1/2 md:block">
            <span className="absolute right-0 top-0 h-[3px] w-full bg-white" />
            <span className="absolute right-0 top-0 h-full w-[3px] bg-white" />
            <span className="absolute right-0 bottom-0 h-[3px] w-full bg-white" />
          </div>

          <AnimateOnView
            animation="zoomIn"
            duration={0.85}
            className="relative z-10 max-w-[850px]"
          >
            <h2 className="text-[28px] leading-[1.28] font-semibold sm:text-[42px]">
              Join Us on Our Instagram and YouTube Handle for More Frequent
              Updates
            </h2>
            <button
              type="button"
              className="mt-8 min-w-[118px] rounded-[5px] bg-[#ea206d] px-6 py-3 text-[20px] font-medium text-white"
            >
              Shop Now
            </button>
          </AnimateOnView>
        </div>
      </section>
      <ShopLatestCollectionSection />
      <BestCollectionSection />
      <StoreLocationsSection />
      <Footer />
    </main>
  );
}
