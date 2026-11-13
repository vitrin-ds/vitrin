"use client";

import { BrandImage } from "@/components/base/brand-image/brand-image";
import { useToday } from "@/lib/use-today";
import { useId } from "react";
import { Container } from "@/components/layout/container/container";
import { Accordion } from "@/components/ui/accordion/accordion";
import { Icon } from "@/components/ui/icon/icon";
import { PaymentNetwork } from "@/components/ui/payment-network/payment-network";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";
import {
  FOOTER_CONTENT,
  FOOTER_LABELS,
  SOCIAL_NETWORK_NAMES,
  type FooterContact,
  type FooterContent,
  type FooterLabels,
  type FooterLinkGroup,
} from "./footer-content";
import { FooterLink, footerLinkVariants } from "./footer-link";
import { FooterNewsletter, type FooterNewsletterProps } from "./footer-newsletter";

// Figma `Footer` (30097:72761; Home and Static Content frames at 1440 / 744 / 375), on
// surface-accent-strong with text-on-accent, inside the page Container (margins 16 / 16 / 40),
// gap 40, padding-bottom 40:
// 1. Contacts (`Row [RTB]`): icon (20, on-accent) + title (title-medium) + detail (body-small);
//    1 / 3 / 4 columns, gap 20, padding-top 32, padding-bottom 24, border-bottom border-accent.
// 2. Newsletter (FooterNewsletter) beside the three link groups from `desktop:` (gap 120). The
//    groups are columns (title-medium + `.Asset Footer Link Item`) from `tablet:`; on mobile each
//    is an Accordion, Tone On Accent (Figma); one open at a time is not enforced.
// 3. Payment methods (PaymentNetwork) and social links (Solid logos from public/brand/social via
//    next/image, alt = network, link named "Follow us on Instagram"): centred and stacked on mobile, spread
//    from `tablet:`.
// 4. Copyright and legal links (label-medium, gap 40), plus Cookie settings, which reopens
//    CookieSettings (from `onCookieSettings`; the link shows only when it is given).
// Landmarks: <footer> (contentinfo), a "Footer" <nav> for the link groups and a "Legal" <nav>.

export interface FooterProps {
  content?: FooterContent;
  labels?: FooterLabels;
  /**
   * Shows the newsletter form; receives the trimmed, valid address. Return `{ error }` for a
   * specific message, or throw to show the generic one.
   */
  onNewsletterSubmit?: FooterNewsletterProps["onSubmit"];
  /** Opens CookieSettings; the site passes the consent root's `openSettings`. */
  onCookieSettings?: () => void;
  /** Copyright year; defaults to the viewer's year, read in the browser (useToday). */
  year?: number;
}

export function Footer({
  content = FOOTER_CONTENT,
  labels = FOOTER_LABELS,
  onNewsletterSubmit,
  onCookieSettings,
  year: yearProp,
}: FooterProps) {
  const id = useId();
  const today = useToday();
  const year = yearProp ?? (today ? Number(today.slice(0, 4)) : undefined);

  return (
    <footer className="bg-surface-accent-strong text-text-on-accent">
      <Container className="flex flex-col gap-40 pb-40">
        <section aria-labelledby={`${id}-contact`}>
          <VisuallyHidden as="h2" id={`${id}-contact`}>
            {labels.contact}
          </VisuallyHidden>
          <ul className="grid grid-cols-1 gap-20 border-b border-border-accent pt-32 pb-24 tablet:grid-cols-3 desktop:grid-cols-4">
            {content.contacts.map((contact) => (
              <FooterContactItem key={contact.title} {...contact} />
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-40 tablet:gap-120 desktop:flex-row">
          {onNewsletterSubmit && (
            <div className="desktop:min-w-0 desktop:flex-1">
              <FooterNewsletter
                onSubmit={onNewsletterSubmit}
                termsHref={content.newsletterTermsHref}
                privacyHref={content.newsletterPrivacyHref}
                labels={labels.newsletter}
              />
            </div>
          )}
          <nav aria-label={labels.linksNav} className="desktop:min-w-0 desktop:flex-1">
            <div className="hidden grid-cols-3 gap-40 tablet:grid">
              {content.linkGroups.map((group) => (
                <FooterLinkColumn key={group.title} {...group} />
              ))}
            </div>
            <div className="tablet:hidden">
              {content.linkGroups.map((group) => (
                <Accordion key={group.title} title={group.title} tone="on-accent" headingLevel={2}>
                  <FooterLinkList group={group} />
                </Accordion>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex flex-col items-center gap-40 tablet:flex-row tablet:justify-between">
          <ul aria-label={labels.paymentMethods} className="flex flex-wrap justify-center gap-12">
            {content.paymentMethods.map((network) => (
              <li key={network} className="flex">
                <PaymentNetwork network={network} />
              </li>
            ))}
          </ul>
          <ul aria-label={labels.social} className="flex flex-wrap justify-center gap-12">
            {content.socialLinks.map((social) => (
              <li key={social.network}>
                <FooterLink
                  href={social.href}
                  size="social"
                  aria-label={labels.socialLink(SOCIAL_NETWORK_NAMES[social.network])}
                >
                  <BrandImage
                    src={`/brand/social/${social.network}.svg`}
                    alt={SOCIAL_NETWORK_NAMES[social.network]}
                    width={24}
                    height={24}
                    className="size-24"
                    fallback={
                      <span
                        aria-hidden
                        className="flex size-24 items-center justify-center rounded-full border border-current text-label-sm"
                      >
                        {SOCIAL_NETWORK_NAMES[social.network].charAt(0)}
                      </span>
                    }
                  />
                </FooterLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-20 tablet:flex-row tablet:justify-between">
          <p className="text-label-md">{labels.copyright(year)}</p>
          <nav aria-label={labels.legalNav}>
            <ul className="flex flex-wrap justify-center gap-x-40 gap-y-20">
              {content.legalLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} size="legal">
                    {link.label}
                  </FooterLink>
                </li>
              ))}
              {onCookieSettings && (
                <li>
                  <button
                    type="button"
                    onClick={onCookieSettings}
                    className={footerLinkVariants({ size: "legal" })}
                  >
                    {labels.cookieSettings}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

function FooterContactItem({ icon, title, detail, href }: FooterContact) {
  return (
    <li className="flex items-start gap-8">
      <Icon name={icon} tone="on-accent" fill={false} className="mt-2 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <p className="text-title-md">{title}</p>
        {href ? (
          <FooterLink href={href} size="detail">
            {detail}
          </FooterLink>
        ) : (
          <p className="text-body-sm">{detail}</p>
        )}
      </div>
    </li>
  );
}

function FooterLinkColumn(group: FooterLinkGroup) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <h2 id={`${id}-title`} className="text-title-md">
        {group.title}
      </h2>
      <FooterLinkList group={group} labelledBy={`${id}-title`} />
    </div>
  );
}

function FooterLinkList({ group, labelledBy }: { group: FooterLinkGroup; labelledBy?: string }) {
  return (
    <ul aria-labelledby={labelledBy} className="flex flex-col">
      {group.links.map((link) => (
        <li key={link.href}>
          <FooterLink href={link.href}>{link.label}</FooterLink>
        </li>
      ))}
    </ul>
  );
}
