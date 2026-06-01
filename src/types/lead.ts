export type ContactMethod = "전화" | "문자" | "이메일" | "카카오톡";

export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  productOrClass: string;
  contactMethod: ContactMethod | "";
  message: string;
  privacyRequiredConsent: boolean;
  optionalInfoConsent: boolean;
  marketingConsent: boolean;
  // honeypot — must stay empty
  website: string;
}

export interface LeadApiRequest {
  name: string;
  phone: string;
  email?: string;
  productOrClass: string;
  contactMethod?: string;
  message?: string;
  privacyRequiredConsent: boolean;
  optionalInfoConsent: boolean;
  marketingConsent: boolean;
  website?: string;
}

export interface LeadApiResponse {
  success: boolean;
  message?: string;
}
