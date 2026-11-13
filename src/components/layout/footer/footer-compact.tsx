import NextLink from "next/link";
import { Container } from "@/components/layout/container/container";
import {
  FOOTER_COMPACT_CONTENT,
  type FooterCompactContact,
  type FooterCompactContent,
  type FooterCompactLink,
} from "./footer-compact-content";

// Figma `Footer [Compact]` (31696:1373; Single Brand template), Single-Layer, Breakpoint is the
// viewport. surface-primary, in the page Container (margins 16 / 16 / 40):
// - Desktop: padding-top 160, bottom 40. Brand (wordmark top, copyright bottom) left; the links
//   column (334 wide, gap 24) right, both 330 tall.
// - Tablet: padding-top 120, links column 300 wide.
// - Mobile: padding-top 40, bottom 24; wordmark, links and copyright stacked, gap 48.
// Wordmark: the largest type style (display-large), text-primary. Rows: an 80px right-aligned
// label (body-small, text-tertiary), gap 16, then the links (body-small, text-primary, gap 4;
// lists 12 apart). Copyright: body-small, text-tertiary. Links underline on hover and focus (no
// Figma state).

const LINK = "text-body-sm text-text-primary hover:underline focus-visible:underline";
const LABEL = "w-80 shrink-0 text-right text-body-sm text-text-tertiary";

function LinkList({ links }: { links: readonly FooterCompactLink[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {links.map((link) => (
        <li key={link.href} className="flex">
          <NextLink href={link.href} className={LINK}>
            {link.label}
          </NextLink>
        </li>
      ))}
    </ul>
  );
}

function ContactRow({ label, value, href }: FooterCompactContact) {
  return (
    <div className="flex gap-16">
      <dt className={LABEL}>{label}</dt>
      <dd className="flex">
        {href ? (
          <a href={href} className={LINK}>
            {value}
          </a>
        ) : (
          <span className="text-body-sm text-text-primary">{value}</span>
        )}
      </dd>
    </div>
  );
}

export interface FooterCompactProps {
  content?: FooterCompactContent;
  /** Names the links landmark. */
  navLabel?: string;
}

export function FooterCompact({
  content = FOOTER_COMPACT_CONTENT,
  navLabel = "Footer",
}: FooterCompactProps) {
  const copyright = <p className="text-body-sm text-text-tertiary">{content.copyright}</p>;
  return (
    <Container
      as="footer"
      className="bg-surface-primary pt-40 pb-24 tablet:pt-120 tablet:pb-40 desktop:pt-160"
    >
      <div className="flex flex-col gap-48 tablet:flex-row tablet:justify-between tablet:gap-0">
        <div className="flex flex-col justify-between">
          <p className="text-display-lg text-text-primary">{content.brand}</p>
          <div className="hidden tablet:flex">{copyright}</div>
        </div>
        <div className="flex flex-col gap-24 tablet:w-300 desktop:w-334">
          <nav aria-label={navLabel} className="flex flex-col gap-24">
            {content.linkGroups.map((group) => (
              <div key={group.label} className="flex gap-16">
                <p className={LABEL}>{group.label}</p>
                <div className="flex flex-col gap-12">
                  {group.lists.map((links, i) => (
                    <LinkList key={i} links={links} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <dl className="flex flex-col gap-4">
            {content.contacts.map((contact) => (
              <ContactRow key={contact.label} {...contact} />
            ))}
          </dl>
        </div>
        <div className="flex tablet:hidden">{copyright}</div>
      </div>
    </Container>
  );
}
