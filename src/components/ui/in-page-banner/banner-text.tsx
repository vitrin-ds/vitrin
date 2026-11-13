import { cn } from "@/lib/cn";
import { BandAction, type BandActionProps } from "../cta-band/band-action";

// Figma `Banner [Text]` (Breakpoint; formerly `Banner [Image - Left]`): text only, no image. A
// tinted promotion band (surface-tertiary, radius 8, padding 32 · 24): overline body-medium text-accent, title
// headline-large text-primary and description body-medium text-primary stacked with no gap, and
// a Button Filled Medium on the right (Default) or below the copy, gap 20 (Mobile; below 744px
// in code). Use it for promotions with prices inside content; CTABand is for the next step of a
// content page (Figma CTABand Don't: "use it for promotions with prices — use Banner").

export const BANNER_TEXT_DEFAULTS = { headingLevel: 2 } as const;

export interface BannerTextProps {
  /** Figma `Overline Text` (`Show Overline`). */
  overline?: string;
  /** Figma `Title Text`. */
  title: string;
  /** Figma `Description Text` (`Show Description`). */
  description?: string;
  /** Figma `Button` (`Show Button`). */
  action?: BandActionProps;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function BannerText({
  overline,
  title,
  description,
  action,
  headingLevel = BANNER_TEXT_DEFAULTS.headingLevel,
  className,
}: BannerTextProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      className={cn(
        "flex flex-col items-start gap-20 rounded-card bg-surface-tertiary px-24 py-32",
        "tablet:flex-row tablet:items-center",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col tablet:flex-1">
        {overline && <p className="text-body-md text-text-accent">{overline}</p>}
        <Heading className="text-headline-lg text-text-primary">{title}</Heading>
        {description && <p className="text-body-md text-text-primary">{description}</p>}
      </div>
      {action && <BandAction {...action} variant="filled" size="md" className="shrink-0" />}
    </section>
  );
}
