"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Dancing_Script } from "next/font/google";
import { useEffect, useState } from "react";
import Footer from "../Footer";
import AnimateOnView from "../AnimateOnView";
import {
  getContactSettings,
  submitContactInquiry,
  type ContactPageBlock,
  type ContactSettings,
} from "../../lib/api/contact";
import { getApiErrorMessage } from "../../lib/api/errors";
import {
  isValidEmail,
  normalizeIndianMobile,
  validateMobileInput,
} from "../../lib/auth/validation";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const contactBannerImage = "/assets/images/sets.png";

const DEFAULT_CONTACT_BLOCKS: ContactPageBlock[] = [
  {
    type: "location",
    title: "Store Location",
    lines: [
      "Silver City Extension, Focal Point, Mirpur Dera Bassi, Punjab 140201",
    ],
  },
  {
    type: "phone",
    title: "WhatsApp",
    lines: ["+91 90418 35216", "+91 82839 90717"],
  },
  {
    type: "email",
    title: "Emails",
    lines: ["katyayaniboutique91@gmail.com"],
  },
];

function resolveContactBlocks(blocks?: ContactPageBlock[]): ContactPageBlock[] {
  const source = blocks?.length ? blocks : DEFAULT_CONTACT_BLOCKS;
  const phone = DEFAULT_CONTACT_BLOCKS.find((item) => item.type === "phone")!;
  const email = DEFAULT_CONTACT_BLOCKS.find((item) => item.type === "email")!;

  return source.map((block) => {
    if (block.type === "phone") return phone;
    if (block.type === "email") return email;
    return block;
  });
}

const blockIcons = {
  location: MapPin,
  phone: Phone,
  email: Mail,
} as const;

function DashedIconRing({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border-2 border-dashed border-[#c4c4c4] bg-white text-[#1a1a1a]">
      {children}
    </span>
  );
}

function ContactBlock({ block }: { block: ContactPageBlock }) {
  const Icon = blockIcons[block.type];
  return (
    <div className="flex gap-4">
      <DashedIconRing>
        <Icon className="h-[22px] w-[22px] stroke-[1.6]" aria-hidden />
      </DashedIconRing>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-[17px] font-semibold leading-tight text-black">
          {block.title}
        </h2>
        <div className="mt-2 space-y-1 text-[15px] leading-snug text-[#444] max-w-[240px]">
          {block.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#d8d8d8] bg-white px-4 py-3 text-[15px] text-[#222] placeholder:text-[#9a9a9a] outline-none transition-[border-color,box-shadow] focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/15";

const inputErrorClass = "border-[#e8b4b4] focus:border-[#c14747] focus:ring-[#c14747]/15";

export function ContactUsContent() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void getContactSettings()
      .then(setSettings)
      .catch(() => {
        setSettings(null);
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  function validateForm() {
    const errors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    } else if (trimmedName.length > 120) {
      errors.name = "Name must be 120 characters or less.";
    }

    if (!trimmedEmail) {
      errors.email = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    const phoneErrors = validateMobileInput(phone);
    if (phoneErrors?.phone) {
      errors.phone = phoneErrors.phone;
    }

    if (!trimmedMessage || trimmedMessage.length < 10) {
      errors.message = "Message must be at least 10 characters.";
    } else if (trimmedMessage.length > 2000) {
      errors.message = "Message must be 2000 characters or less.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    if (!validateForm()) return;

    const normalizedPhone = normalizeIndianMobile(phone);
    if (!normalizedPhone) {
      setFieldErrors((prev) => ({
        ...prev,
        phone: "Enter a valid 10-digit Indian mobile number.",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        message: message.trim(),
      });
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setFieldErrors({});
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const hero = settings?.contactPage;
  const contactBlocks = resolveContactBlocks(hero?.blocks);

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
        <div className="relative mx-auto flex min-h-[200px] max-w-[1320px] flex-col items-center justify-center px-6 py-14 text-center text-white sm:min-h-[260px] sm:py-16 lg:px-10">
          <AnimateOnView animation="fadeInDown" duration={0.8}>
            <p
              className={`${dancingScript.className} text-[22px] text-[#ea206d] sm:text-[26px]`}
            >
              {hero?.heroEyebrow ?? "Let's connect"}
            </p>
            <h1 className="mt-3 max-w-[640px] text-[32px] font-semibold leading-tight tracking-tight sm:text-[42px] md:text-[46px]">
              {hero?.heroTitle ?? "Contact Us"}
            </h1>
            <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
              {hero?.heroSubtitle ??
                "Visit our Mirpur Dera Bassi stores, call us, or write in — our team is happy to help with orders, styling, and more."}
            </p>
          </AnimateOnView>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-6 py-14 lg:px-10 lg:py-16">
        <section className="grid grid-cols-1 gap-12 border-b border-[#e5e5e5] pb-14 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:pb-16">
          {loadingSettings ? (
            <>
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-24 animate-pulse rounded-xl bg-[#f5f5f5]"
                />
              ))}
            </>
          ) : (
            contactBlocks.map((block, index) => (
              <AnimateOnView
                key={`${block.type}-${block.title}`}
                animation="fadeInUp"
                delay={index * 120}
                duration={0.7}
              >
                <ContactBlock block={block} />
              </AnimateOnView>
            ))
          )}
        </section>

        <section className="mx-auto max-w-[640px] pt-14 text-center lg:pt-16">
          <AnimateOnView animation="fadeInUp" duration={0.75}>
            <h2 className="text-[28px] font-semibold tracking-tight text-black sm:text-[34px]">
              Got Any Questions?
            </h2>
            <p className="mt-3 text-[16px] text-[#6b6b6b]">
              Use the form below to get in touch with the sales team
            </p>
          </AnimateOnView>

          {submitted ? (
            <div className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-left">
              <h3 className="text-[20px] font-semibold text-emerald-800">
                Message sent
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-emerald-700">
                Thank you for reaching out. Our team has received your enquiry
                and will get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-5 cursor-pointer text-[14px] font-medium text-[#9a1548] underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="mt-10 text-left"
              onSubmit={(event) => void handleSubmit(event)}
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="sr-only" htmlFor="contact-name">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Name *"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={`${inputClass} ${fieldErrors.name ? inputErrorClass : ""}`}
                  />
                  {fieldErrors.name ? (
                    <p className="mt-1.5 text-[13px] text-[#c14747]">
                      {fieldErrors.name}
                    </p>
                  ) : null}
                </div>
                <div>
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
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={`${inputClass} ${fieldErrors.email ? inputErrorClass : ""}`}
                  />
                  {fieldErrors.email ? (
                    <p className="mt-1.5 text-[13px] text-[#c14747]">
                      {fieldErrors.email}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <label className="sr-only" htmlFor="contact-phone">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="Phone Number *"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={`${inputClass} ${fieldErrors.phone ? inputErrorClass : ""}`}
                />
                {fieldErrors.phone ? (
                  <p className="mt-1.5 text-[13px] text-[#c14747]">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 sm:mt-5">
                <label className="sr-only" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Message *"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className={`${inputClass} resize-y ${fieldErrors.message ? inputErrorClass : ""}`}
                />
                {fieldErrors.message ? (
                  <p className="mt-1.5 text-[13px] text-[#c14747]">
                    {fieldErrors.message}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p className="mt-4 text-[14px] text-[#c14747]" role="alert">
                  {formError}
                </p>
              ) : null}

              <div className="mt-8 flex justify-center sm:mt-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-13 cursor-pointer rounded-[5px] bg-[#ea206d] px-9 text-[19px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
