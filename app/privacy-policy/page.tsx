import type { Metadata } from "next";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Katyayani Designer Hub",
  description:
    "Read the privacy policy for Katyayani Designer Hub, including information collection, use, sharing, and contact details.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <section className="mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[980px]">
          <h1 className="text-[28px] font-semibold leading-tight text-[#111111] sm:text-[32px]">
            Privacy Policy - Katyayani Designer Hub
          </h1>

          <div className="mt-6 space-y-5 text-[18px] leading-[1.8] text-[#111111]">
            <p>
              Katyayani Designer Hub recognizes the importance of maintaining your privacy. We value your privacy and appreciate your trust in us. This Policy describes how we treat user information we collect on www.katyayanidesignerhub.com.
            </p>

            <p>
              This Privacy Policy applies to current and former visitors to our website and to our online customers. By visiting and/or using our website, you agree to this Privacy Policy.
            </p>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">Information we collect</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  <span className="font-semibold">Contact information:</span> Katyayani Designer Hub might collect your name, email, mobile number, phone number, street, city, state, pin code, country, and IP address.
                </li>
                <li>
                  <span className="font-semibold">Payment and billing information:</span> Katyayani Designer Hub might collect your billing name, billing address, and payment method when you buy a product. We do not collect your credit card number or credit card expiry date on our website.
                </li>
                <li>
                  <span className="font-semibold">Other information:</span> Katyayani Designer Hub may collect information about your IP address and browser. This may include the site you came from, duration of time spent on our site, and pages accessed.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">How we collect information</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>From third parties when you use integrated social media features.</li>
                <li>Directly from you when you register or make a purchase.</li>
                <li>Passively through tools like Google Analytics, cookies, and web beacons.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">Use of your personal information</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>For security purposes, marketing, and transactional communications.</li>
                <li>To contact you regarding purchases or promotional offers.</li>
                <li>To respond to your requests and improve our services.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">Sharing of information with third-parties</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>We share information with vendors and service providers.</li>
                <li>We may share information if required by law or to protect our business.</li>
                <li>We may share information with any successor to part of our business.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">Third party sites</h2>
              <p className="mt-3">
                If you click on links to third-party websites, this policy does not apply. Read the privacy policies of those sites carefully.
              </p>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">Updates to this policy</h2>
              <p className="mt-3">
                This Privacy Policy was last updated on 20 Aug 2026. Please check our website periodically for updates.
              </p>
            </div>

            <div>
              <h2 className="text-[22px] font-semibold text-[#111111]">Jurisdiction</h2>
              <p className="mt-3">
                If you visit our website, your visit and any disputes over privacy are subject to this Policy and the website&apos;s terms of use. Disputes shall be governed by the laws of India and shall be subject to the jurisdiction of the Punjab and Haryana High Court.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
