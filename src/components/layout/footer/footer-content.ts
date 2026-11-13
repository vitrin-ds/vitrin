import type { IconName } from "@/components/ui/icon/icon-names";
import type { PaymentNetworkId } from "@/components/ui/payment-network/payment-network";

// The Footer's data: placeholder content from Figma (Footer, 30097:72761) until the CMS
// (src/lib/content) provides it. Kept apart from the component so a page passes its own. Contact
// details match the legal pages (Things Retail Ltd., London). Social networks have Solid logos in
// public/brand/social (Figma Icons `s-*`, white for the accent footer).

export interface FooterContact {
  /** Material Symbol from Figma: chat · call · send · location_on. */
  icon: IconName;
  title: string;
  detail: string;
  /** tel: / mailto: / a page; the detail becomes a link when given. */
  href?: string;
}

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: readonly FooterLinkItem[];
}

export type SocialNetwork = "facebook" | "instagram" | "tiktok" | "youtube" | "x" | "linkedin";

export interface FooterSocialLink {
  network: SocialNetwork;
  href: string;
}

export interface FooterContent {
  contacts: readonly FooterContact[];
  linkGroups: readonly FooterLinkGroup[];
  paymentMethods: readonly PaymentNetworkId[];
  socialLinks: readonly FooterSocialLink[];
  legalLinks: readonly FooterLinkItem[];
  /** The documents linked from the newsletter consent line. */
  newsletterTermsHref: string;
  newsletterPrivacyHref: string;
}

export const SOCIAL_NETWORK_NAMES: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  linkedin: "LinkedIn",
};

export const FOOTER_CONTENT: FooterContent = {
  contacts: [
    { icon: "chat", title: "Customer Service", detail: "Mon–Sat, 9am–6pm UK time", href: "/help" },
    { icon: "call", title: "Call Us", detail: "+44 20 0000 0000", href: "tel:+442000000000" },
    {
      icon: "send",
      title: "Get in Touch",
      detail: "hello@things.example",
      href: "mailto:hello@things.example",
    },
    {
      icon: "location_on",
      title: "Address",
      detail: "Things Retail Ltd., 1 Example Street, London EC1A 1AA, UK",
    },
  ],
  linkGroups: [
    {
      title: "Shop",
      links: [
        { label: "Skincare", href: "/c/skin-care" },
        { label: "Hair Care", href: "/c/hair-care" },
        { label: "Body Care", href: "/c/body-care" },
        { label: "Makeup", href: "/c/make-up" },
        { label: "Accessories", href: "/c/make-up/makeup-tools" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "/help/contact" },
        { label: "FAQ", href: "/help" },
        { label: "Campaigns", href: "/collections/campaigns" },
        { label: "Blog", href: "/journal" },
        { label: "Find a Store", href: "/stores" },
      ],
    },
    {
      title: "Help & Support",
      links: [
        { label: "Shipping", href: "/help/orders" },
        { label: "Returns & Refunds", href: "/help/returns" },
        { label: "Warranty", href: "/help/returns/my-item-arrived-damaged-or-faulty" },
        { label: "Track Order", href: "/account/orders" },
        { label: "Secure Payment", href: "/help/payment" },
      ],
    },
  ],
  paymentMethods: ["visa", "mastercard", "amex", "google-pay", "apple-pay"],
  socialLinks: [
    { network: "facebook", href: "https://facebook.example/things" },
    { network: "x", href: "https://x.example/things" },
    { network: "instagram", href: "https://instagram.example/things" },
    { network: "tiktok", href: "https://tiktok.example/things" },
  ],
  legalLinks: [
    { label: "Terms of Service", href: "/legal/terms-of-use" },
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
  ],
  newsletterTermsHref: "/legal/terms-of-use",
  newsletterPrivacyHref: "/legal/privacy-policy",
};

export interface FooterLabels {
  /** Name of the footer's link navigation (screen readers list it among landmarks). */
  linksNav: string;
  contact: string;
  paymentMethods: string;
  social: string;
  /** "Follow us on Instagram": the social link's name. Put the store's name in your labels. */
  socialLink: (network: string) => string;
  legalNav: string;
  /** Opens CookieSettings; shown when the Footer gets `onCookieSettings`. */
  cookieSettings: string;
  /** No year while rendering on the server: the year is read in the browser. */
  copyright: (year: number | undefined) => string;
  newsletter: {
    title: string;
    body: string;
    emailLabel: string;
    placeholder: string;
    submit: string;
    /** Consent line under the form; the links come from `termsHref` / `privacyHref`. */
    consentBefore: string;
    terms: string;
    consentBetween: string;
    privacy: string;
    invalidEmail: string;
    success: string;
    failure: string;
  };
}

export const FOOTER_LABELS: FooterLabels = {
  linksNav: "Footer",
  contact: "Contact",
  paymentMethods: "Accepted payment methods",
  social: "Follow us",
  socialLink: (network) => `Follow us on ${network}`,
  legalNav: "Legal",
  cookieSettings: "Cookie settings",
  copyright: (year) => (year ? `Copyright © ${year}` : "Copyright"),
  newsletter: {
    title: "Join Our Newsletter",
    body: "Sign up to our newsletter & receive 10% off your first order.",
    emailLabel: "Email address",
    placeholder: "Enter your email",
    submit: "Sign Up",
    consentBefore: "By subscribing you agree to the",
    terms: "Terms of Use",
    consentBetween: "&",
    privacy: "Privacy Policy",
    invalidEmail: "Enter a valid email address, e.g. name@example.com.",
    success: "Thanks! Check your inbox to confirm your subscription.",
    failure: "We couldn't sign you up. Please try again.",
  },
};
