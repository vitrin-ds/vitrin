import type { ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "../../avatar/avatar";
import { initialsOf } from "../byline/card-feature-byline";
import { BandAction } from "../../cta-band/band-action";

// Figma `Card.Feature.Author`: the author bio at the end of an article. surface-secondary, radius 16,
// padding 24, gap 16: Avatar Default (48) + a text column (gap 8) of overline (label-medium,
// text-accent), name (title-medium, text-primary), bio (body-medium, text-secondary) and the
// optional "More from …" Ghost button (Figma `Show Button`), which links to the author page.

export interface CardFeatureAuthorLabels {
  overline: string;
}

export const CARD_FEATURE_AUTHOR_LABELS: CardFeatureAuthorLabels = { overline: "About the author" };

export const CARD_FEATURE_AUTHOR_DEFAULTS = { headingLevel: 2 } as const;

export interface CardFeatureAuthorProps {
  /** Figma `Name Text`: name and credentials, e.g. "Jamie Doe, Senior Beauty Editor". */
  name: string;
  /** Figma `Bio Text` (2–3 sentences). */
  children: ReactNode;
  /** Photo URL (Avatar Photo); initials are used without it. */
  photo?: string;
  /** Avatar initials; derived from the name when left out. */
  initials?: string;
  /** Figma `Show Button`: the author page link, e.g. { label: "More from Jamie", href }. */
  link?: { label: string; href: string };
  headingLevel?: 2 | 3 | 4;
  labels?: CardFeatureAuthorLabels;
  className?: string;
}

export function CardFeatureAuthor({
  name,
  children,
  photo,
  initials,
  link,
  headingLevel = CARD_FEATURE_AUTHOR_DEFAULTS.headingLevel,
  labels = CARD_FEATURE_AUTHOR_LABELS,
  className,
}: CardFeatureAuthorProps) {
  const id = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={`${id}-name`}
      className={cn("flex items-start gap-16 rounded-surface bg-surface-secondary p-24", className)}
    >
      {/* Decorative: the name is the heading next to it. */}
      <span aria-hidden className="flex">
        {photo ? (
          <Avatar variant="photo" src={photo} alt="" />
        ) : (
          <Avatar variant="letter" initials={initials ?? initialsOf(name)} name={name} />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-8">
        <p className="text-label-md text-text-accent">{labels.overline}</p>
        <Heading id={`${id}-name`} className="text-title-md text-text-primary">
          {name}
        </Heading>
        <div className="text-body-md text-text-secondary">{children}</div>
        {link && <BandAction variant="ghost" label={link.label} href={link.href} />}
      </div>
    </section>
  );
}
