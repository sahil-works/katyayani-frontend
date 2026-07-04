const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NAME_MAX_LENGTH = 80;
export const OTP_LENGTH = 6;

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function normalizeIndianMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10 && INDIAN_MOBILE_PATTERN.test(digits)) {
    return digits;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91") &&
    INDIAN_MOBILE_PATTERN.test(digits.slice(2))
  ) {
    return digits.slice(2);
  }

  return null;
}

export function formatIndianMobileDisplay(mobile: string) {
  return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
}

export function validateMobileInput(
  input: string,
): FieldErrors<"phone"> | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return { phone: "Enter your mobile number." };
  }

  if (!normalizeIndianMobile(trimmed)) {
    return { phone: "Enter a valid 10-digit Indian mobile number." };
  }

  return null;
}

export function validateOtpInput(input: string): FieldErrors<"otp"> | null {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return { otp: "Enter the 6-digit OTP." };
  }

  if (digits.length !== OTP_LENGTH) {
    return { otp: "OTP must be exactly 6 digits." };
  }

  return null;
}

export function isValidEmail(input: string): boolean {
  return EMAIL_PATTERN.test(input.trim());
}

export function validateProfileCompletion(input: {
  firstName: string;
  lastName: string;
  email?: string;
}): FieldErrors<"firstName" | "lastName" | "email"> | null {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = (input.email ?? "").trim();
  const errors: FieldErrors<"firstName" | "lastName" | "email"> = {};

  if (!firstName) {
    errors.firstName = "First name is required.";
  } else if (firstName.length > NAME_MAX_LENGTH) {
    errors.firstName = `First name must be ${NAME_MAX_LENGTH} characters or less.`;
  }

  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (lastName.length > NAME_MAX_LENGTH) {
    errors.lastName = `Last name must be ${NAME_MAX_LENGTH} characters or less.`;
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
