import Link from "next/link";
import { Dancing_Script } from "next/font/google";
// import { CatalogNavLinks } from "./catalog/CatalogNavLinks";
import { CategoryNavLinks } from "./categories/CategoryNavLinks";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const footerBackgroundImage = "/assets/images/footer.png";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "All Collections", href: "/collections" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function Footer() {
  return (
    <footer
      className="relative mt-16 overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: `url("${footerBackgroundImage}")` }}
      aria-label="Website footer"
    >

      <div className="relative mx-auto w-full max-w-[1320px] px-6 pb-6 pt-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-white/20 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p
              className={`${dancingScript.className} text-[30px] leading-none text-[#b7bd2d]`}
            >
              Katyayani Designer Hub
            </p>
            <p className="mt-6 max-w-[300px] text-[18px] leading-[1.65] text-[#000]">
              Affordable designer styles for every day and special moments.
              Shop premium collections with trusted quality.
            </p>
          </div>

          <div>
            <h3 className="text-[24px] font-medium leading-none text-[#000]">
              Quick Links
            </h3>
            <ul className="mt-6 space-y-3 text-[18px] text-[#000]">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors text-[#000] hover:text-[#c4ca38]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[24px] font-medium leading-none text-[#000]">
              Category
            </h3>
            <ul className="mt-6 space-y-3 text-[18px] text-[#000]">
              {/* <CatalogNavLinks linkClassName="transition-colors text-[#000] hover:text-[#c4ca38]" /> */}
              <CategoryNavLinks linkClassName="transition-colors text-[#000] hover:text-[#c4ca38]" />
            </ul>
          </div>

          <div>
            <h3 className="text-[24px] font-medium leading-none text-[#000]">
              Contact
            </h3>
            <ul className="mt-6 space-y-3 text-[18px] leading-[1.55] text-[#000]">
              <li>Silver City Extension, Focal Point, Mirpur Dera Bassi, Punjab 140201</li>
              
              <li>
                <a href="tel:+919876543210" className="text-[#000] hover:text-[#c4ca38]">
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@katyayanidesignerhub.com"
                  className="text-[#000] hover:text-[#c4ca38]"
                >
                  info@katyayanidesignerhub.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-[16px] text-black sm:flex-row">
          <p>Copyright {new Date().getFullYear()} Katyayani Designer Hub.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
