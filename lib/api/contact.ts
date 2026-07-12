import { apiGet, apiPost } from "./client";

export type ContactPageBlock = {
  type: "location" | "phone" | "email";
  title: string;
  lines: string[];
};

export type ContactSettings = {
  contactPage: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    blocks: ContactPageBlock[];
  };
};

export type ContactInquiryInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  createdAt: string;
};

export async function getContactSettings(): Promise<ContactSettings> {
  const result = await apiGet<ContactSettings>("/contact/settings");
  return result.data;
}

export async function submitContactInquiry(
  input: ContactInquiryInput,
): Promise<ContactInquiry> {
  const result = await apiPost<ContactInquiry>("/contact/inquiries", input);
  return result.data;
}
