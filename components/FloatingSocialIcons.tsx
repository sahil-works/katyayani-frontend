"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_URL = "https://wa.me/919041835216";
const INSTAGRAM_URL =
  "https://www.instagram.com/katyayani_designer_hub/?hl=en";

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[26px] w-[26px]"
      fill="currentColor"
    >
      <path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.27-.02-.42.12-.56.13-.12.28-.32.42-.48.14-.16.18-.27.28-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.57.65.2 1.25.18 1.72.11.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32z" />
      <path d="M12.04 2C6.5 2 2 6.48 2 12c0 1.77.46 3.45 1.28 4.91L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22C17.56 22 22 17.52 22 12S17.56 2 12.04 2zm0 18.15c-1.58 0-3.05-.42-4.33-1.16l-.31-.18-3.12.82.83-3.04-.2-.33A8.1 8.1 0 0 1 3.9 12c0-4.47 3.65-8.1 8.14-8.1 4.48 0 8.13 3.63 8.13 8.1 0 4.47-3.65 8.15-8.13 8.15z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[24px] w-[24px]"
      fill="currentColor"
    >
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2z" />
      <circle cx="17.35" cy="6.7" r="1.15" />
      <path d="M17.5 3H6.5C4.57 3 3 4.57 3 6.5v11C3 19.43 4.57 21 6.5 21h11c1.93 0 3.5-1.57 3.5-3.5v-11C21 4.57 19.43 3 17.5 3zm1.8 14.5c0 1-.8 1.8-1.8 1.8h-11c-1 0-1.8-.8-1.8-1.8v-11c0-1 .8-1.8 1.8-1.8h11c1 0 1.8.8 1.8 1.8v11z" />
    </svg>
  );
}

export default function FloatingSocialIcons() {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed right-3 bottom-20 z-50 flex flex-col gap-3 sm:right-6 sm:bottom-7"
      aria-label="Social media links"
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-transform hover:scale-105 hover:brightness-105 active:scale-95"
      >
        <WhatsAppIcon />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow us on Instagram"
        className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(45deg,#f09433_0%,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888_100%)] text-white shadow-[0_8px_24px_rgba(188,24,136,0.35)] transition-transform hover:scale-105 hover:brightness-105 active:scale-95"
      >
        <InstagramIcon />
      </a>
    </div>
  );
}
