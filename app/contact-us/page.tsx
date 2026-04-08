import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import { Mail, MapPin, Phone } from "lucide-react";
import Footer from "../../components/Footer";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const contactBannerImage = "/assets/images/sets.png";

export const metadata: Metadata = {
  title: "Contact Us | Katyayani Designer Hub",
  description:
    "Get in touch with Katyayani Designer Hub — store locations in Delhi and Gurgaon, phone, email, and contact form.",
};

const contactBlocks = [
  {
    icon: MapPin,
    title: "Delhi Store",
    lines: [
      "Silver City Extension, Focal Point, Mirpur Dera Bassi, Punjab 140201",
    ],
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+91-1234567890", "+91-0987654321", "+91-1234567890"],
  },
  {
    icon: Mail,
    title: "Emails",
    lines: ["info@katyayanidesignerhub.com"],
  },
];

function DashedIconRing({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border-2 border-dashed border-[#c4c4c4] bg-white text-[#1a1a1a]">
      {children}
    </span>
  );
}

export default function ContactUsPage() {
  return (
    <main className="min-h-[calc(100vh-96px)] bg-white text-[#111]">
      <section
        className="relative w-full overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url("${contactBannerImage}")` }}
        aria-label="Contact page banner"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/65"
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-20 top-1/2 h-[180px] w-10 -translate-y-1/2 opacity-40 sm:left-[8%] sm:opacity-100">
          <span className="absolute left-0 top-0 h-0.5 w-full bg-[#9ea600]" />
          <span className="absolute left-0 top-0 h-full w-0.5 bg-[#9ea600]" />
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#9ea600]" />
        </div>
        <div className="pointer-events-none absolute -right-20 top-1/2 h-[180px] w-10 -translate-y-1/2 opacity-40 sm:right-[8%] sm:opacity-100">
          <span className="absolute right-0 top-0 h-0.5 w-full bg-[#9ea600]" />
          <span className="absolute right-0 top-0 h-full w-0.5 bg-[#9ea600]" />
          <span className="absolute bottom-0 right-0 h-0.5 w-full bg-[#9ea600]" />
        </div>
        <div className="relative mx-auto flex min-h-[200px] max-w-[1320px] flex-col items-center justify-center px-6 py-14 text-center text-white sm:min-h-[260px] sm:py-16 lg:px-10">
          <p
            className={`${dancingScript.className} text-[22px] text-[#d4db5c] sm:text-[26px]`}
          >
            Let&apos;s connect
          </p>
          <h1 className="mt-3 max-w-[640px] text-[32px] font-semibold leading-tight tracking-tight sm:text-[42px] md:text-[46px]">
            Contact Us
          </h1>
          <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
            Visit our Mirpur Dera Bassi stores, call us, or write in — our team
            is happy to help with orders, styling, and more.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-16">
        <section className="grid grid-cols-1 gap-12 border-b border-[#e5e5e5] pb-14 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:pb-16">
          {contactBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.title} className="flex gap-4">
                <DashedIconRing>
                  <Icon className="h-[22px] w-[22px] stroke-[1.6]" aria-hidden />
                </DashedIconRing>
                <div className="min-w-0 pt-0.5">
                  <h2 className="text-[17px] font-semibold leading-tight text-black">
                    {block.title}
                  </h2>
                  <div className="mt-2 space-y-1 text-[15px] leading-snug text-[#444] max-w-[200px]">
                    {block.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mx-auto max-w-[640px] pt-14 text-center lg:pt-16">
          <h2 className="text-[28px] font-semibold tracking-tight text-black sm:text-[34px]">
            Got Any Questions?
          </h2>
          <p className="mt-3 text-[16px] text-[#6b6b6b]">
            Use the form below to get in touch with the sales team
          </p>

          <form className="mt-10 text-left" action="#" method="post">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <label className="sr-only" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Name"
                className="w-full rounded-lg border border-[#d8d8d8] bg-white px-4 py-3 text-[15px] text-[#222] placeholder:text-[#9a9a9a] outline-none transition-[border-color,box-shadow] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/15"
              />
              <label className="sr-only" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email *"
                className="w-full rounded-lg border border-[#d8d8d8] bg-white px-4 py-3 text-[15px] text-[#222] placeholder:text-[#9a9a9a] outline-none transition-[border-color,box-shadow] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/15"
              />
            </div>

            <label className="sr-only" htmlFor="contact-phone">
              Phone Number
            </label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone Number"
              className="mt-4 w-full rounded-lg border border-[#d8d8d8] bg-white px-4 py-3 text-[15px] text-[#222] placeholder:text-[#9a9a9a] outline-none transition-[border-color,box-shadow] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/15 sm:mt-5"
            />

            <label className="sr-only" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder="Message"
              className="mt-4 w-full resize-y rounded-lg border border-[#d8d8d8] bg-white px-4 py-3 text-[15px] text-[#222] placeholder:text-[#9a9a9a] outline-none transition-[border-color,box-shadow] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/15 sm:mt-5"
            />

            <div className="mt-8 flex justify-center sm:mt-10">
              <button
                type="submit"
                className="h-13 rounded-none bg-[#9ea600] px-9 text-[19px] font-medium text-white ml-2"
              >
                Send
              </button>
            </div>
          </form>

          <p className="mt-10 max-w-[520px] mx-auto text-center text-[12px] leading-relaxed text-[#888] sm:mt-12">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              className="underline underline-offset-2 hover:text-[#444]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              className="underline underline-offset-2 hover:text-[#444]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
