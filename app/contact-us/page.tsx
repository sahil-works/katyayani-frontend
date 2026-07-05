import type { Metadata } from "next";
import { ContactUsContent } from "../../components/contact/ContactUsContent";

export const metadata: Metadata = {
  title: "Contact Us | Katyayani Designer Hub",
  description:
    "Get in touch with Katyayani Designer Hub — store locations, phone, email, and contact form.",
};

export default function ContactUsPage() {
  return <ContactUsContent />;
}
