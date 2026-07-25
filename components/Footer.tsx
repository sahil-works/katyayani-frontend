import Link from "next/link";
import { Dancing_Script } from "next/font/google";
// import { CatalogNavLinks } from "./catalog/CatalogNavLinks";
import { CategoryNavLinks } from "./categories/CategoryNavLinks";
import AnimateOnView from "./AnimateOnView";

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
          <AnimateOnView animation="fadeInUp" delay={0} duration={0.7}>
            <Link
              href="/"
              className={`${dancingScript.className} text-[30px] leading-none text-[#ea206d]`}
            >
              Katyayani Designer Hub
            </Link>
            <p className="mt-6 max-w-[300px] text-[18px] leading-[1.65] text-[#000]">
              Affordable designer styles for every day and special moments.
              Shop premium collections with trusted quality.
            </p>
          </AnimateOnView>

          <AnimateOnView animation="fadeInUp" delay={80} duration={0.7}>
            <h3 className="text-[24px] font-medium leading-none text-[#000]">
              Quick Links
            </h3>
            <ul className="mt-6 space-y-3 text-[18px] text-[#000]">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors text-[#000] hover:text-[#ea206d]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AnimateOnView>

          <AnimateOnView animation="fadeInUp" delay={160} duration={0.7}>
            <h3 className="text-[24px] font-medium leading-none text-[#000]">
              Category
            </h3>
            <ul className="mt-6 space-y-3 text-[18px] text-[#000]">
              {/* <CatalogNavLinks linkClassName="transition-colors text-[#000] hover:text-[#ea206d]" /> */}
              <CategoryNavLinks
                limit={5}
                linkClassName="transition-colors text-[#000] hover:text-[#ea206d]"
              />
            </ul>
          </AnimateOnView>

          <AnimateOnView animation="fadeInUp" delay={240} duration={0.7}>
            <h3 className="text-[24px] font-medium leading-none text-[#000]">
              Contact
            </h3>
            <ul className="mt-6 space-y-3 text-[18px] leading-[1.55] text-[#000]">
              <li>Silver City Extension, Focal Point, Mirpur Dera Bassi, Punjab 140201</li>
              <li>
                <a
                  href="https://wa.me/919041835216"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#000] hover:text-[#ea206d]"
                >
                  WhatsApp: +91 90418 35216
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918283990717"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#000] hover:text-[#ea206d]"
                >
                  WhatsApp: +91 82839 90717
                </a>
              </li>
              <li>
                <a
                  href="mailto:katyayaniboutique91@gmail.com"
                  className="text-[#000] hover:text-[#ea206d]"
                >
                  katyayaniboutique91@gmail.com
                </a>
              </li>
            </ul>
          </AnimateOnView>
        </div>

        <AnimateOnView
          animation="fadeIn"
          delay={100}
          className="flex flex-col items-center justify-between gap-3 pt-6 text-[16px] text-black sm:flex-row"
        >
          <p>Copyright {new Date().getFullYear()} Katyayani Designer Hub.</p>
          <p>All rights reserved.</p>
        </AnimateOnView>
      </div>
    </footer>
  );
}
