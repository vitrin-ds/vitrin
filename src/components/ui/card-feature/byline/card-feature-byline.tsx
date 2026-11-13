import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "../../avatar/avatar";
import { Icon } from "../../icon/icon";
import { Link } from "../../link/link";

// Figma `Card.Feature.Byline` for articles (E-E-A-T), wrapping on narrow widths (gap 12 / 24):
// - Author: Avatar Small (36) + name (label-large, text-primary) over role (label-small,
//   text-tertiary), gap 12. The name links to the author page (Link, neutral).
// - Reviewer (Figma `Show Reviewer`): the `info` glyph (20, accent) + "Medically reviewed by …"
//   and role, same type as the author.
// - Meta (Figma `Show Meta`): published · updated · reading time in label-medium text-secondary;
//   dates are <time dateTime> formatted with Intl. Use the same data for the Article JSON-LD.
// The avatar is decorative here: the name is right next to it.

export interface CardFeatureBylinePerson {
  name: string;
  /** Credentials or job title, e.g. "Senior Beauty Editor". */
  role?: string;
  /** Author / reviewer page. */
  href?: string;
}

export interface CardFeatureBylineAuthor extends CardFeatureBylinePerson {
  /** Photo URL (Avatar Photo); initials are used without it. */
  photo?: string;
  /** Avatar initials; derived from the name when left out. */
  initials?: string;
}

export interface CardFeatureBylineLabels {
  by: (name: ReactNode) => ReactNode;
  reviewedBy: (name: ReactNode) => ReactNode;
  published: (date: ReactNode) => ReactNode;
  updated: (date: ReactNode) => ReactNode;
  readingTime: (minutes: number) => string;
  separator: string;
}

export const CARD_FEATURE_BYLINE_LABELS: CardFeatureBylineLabels = {
  by: (name) => <>By {name}</>,
  reviewedBy: (name) => <>Medically reviewed by {name}</>,
  published: (date) => <>Published {date}</>,
  updated: (date) => <>Updated {date}</>,
  readingTime: (minutes) => `${minutes} min read`,
  separator: " · ",
};

export const CARD_FEATURE_BYLINE_DEFAULTS = { locale: "en-GB" } as const;

/** "JD" from "Jane Doe" (or "Jane Doe, Editor"); one letter for a single name. */
export function initialsOf(name: string): string {
  const words = (name.split(",")[0] ?? "").trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

/** A <time> with an ISO date and the locale's short date ("14 Oct 2026"). */
export function ArticleDate({ value, locale }: { value: Date | string; locale: string }) {
  const date = toDate(value);
  const text = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return <time dateTime={date.toISOString().slice(0, 10)}>{text}</time>;
}

export interface CardFeatureBylineProps {
  author: CardFeatureBylineAuthor;
  /** Figma `Show Reviewer`: only someone who actually reviewed the content. */
  reviewer?: CardFeatureBylinePerson;
  /** Figma `Show Meta`: publication date (ISO string or Date). */
  published?: Date | string;
  /** Last real update (Figma Don't: no fake "updated" dates). */
  updated?: Date | string;
  readingMinutes?: number;
  /** Date format locale. */
  locale?: string;
  labels?: CardFeatureBylineLabels;
  className?: string;
}

function PersonName({ person }: { person: CardFeatureBylinePerson }) {
  return person.href ? (
    <Link href={person.href} variant="neutral">
      {person.name}
    </Link>
  ) : (
    person.name
  );
}

export function CardFeatureByline({
  author,
  reviewer,
  published,
  updated,
  readingMinutes,
  locale = CARD_FEATURE_BYLINE_DEFAULTS.locale,
  labels = CARD_FEATURE_BYLINE_LABELS,
  className,
}: CardFeatureBylineProps) {
  const meta: ReactNode[] = [];
  if (published) meta.push(labels.published(<ArticleDate value={published} locale={locale} />));
  if (updated) meta.push(labels.updated(<ArticleDate value={updated} locale={locale} />));
  if (readingMinutes != null) meta.push(labels.readingTime(readingMinutes));

  return (
    <div className={cn("flex flex-wrap items-center gap-x-24 gap-y-12", className)}>
      <div className="flex items-center gap-12">
        <span aria-hidden className="flex">
          {author.photo ? (
            <Avatar variant="photo" size="sm" src={author.photo} alt="" />
          ) : (
            <Avatar
              variant="letter"
              size="sm"
              initials={author.initials ?? initialsOf(author.name)}
              name={author.name}
            />
          )}
        </span>
        <PersonLines person={author} line={labels.by(<PersonName person={author} />)} />
      </div>
      {reviewer && (
        <div className="flex items-center gap-12">
          <Icon name="info" className="shrink-0" />
          <PersonLines
            person={reviewer}
            line={labels.reviewedBy(<PersonName person={reviewer} />)}
          />
        </div>
      )}
      {meta.length > 0 && (
        <p className="text-label-md text-text-secondary">
          {meta.map((item, i) => (
            <span key={i}>
              {i > 0 && labels.separator}
              {item}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function PersonLines({ person, line }: { person: CardFeatureBylinePerson; line: ReactNode }) {
  return (
    <p className="flex flex-col">
      <span className="text-label-lg text-text-primary">{line}</span>
      {person.role && <span className="text-label-sm text-text-tertiary">{person.role}</span>}
    </p>
  );
}
