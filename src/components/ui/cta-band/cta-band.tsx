import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BandAction, type BandActionProps } from "./band-action";

// Figma `CTABand` (Layout): a tinted band (surface-secondary, radius 16) that ends a content
// page with a clear next step: title + body (gap 8) and up to two Buttons (gap 8, wrapping).
// - Horizontal (`.Base.CTABand`, desktop): padding 48, text on 6 columns (676) left, actions
//   right; title headline-small.
// - Stacked (`.Base.CTABand.Stacked`, tablet/mobile): padding 24, gap 16, everything stacked;
//   title title-large.
// - Responsive (code only): Stacked below 1024px and Horizontal from `desktop:` (Figma Do:
//   "Use Stacked below 1024px").
// Body is body-medium text-secondary. Primary is Button Filled, the secondary (Figma
// `Show Secondary Action`) Button Outline; each links (href) or acts (onClick).

const RESPONSIVE = {
  root: "flex-col items-start gap-16 p-24 desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-24 desktop:p-48",
  text: "desktop:w-676",
  title: "text-title-lg desktop:text-headline-sm",
};

export const ctaBandVariants = cva("flex rounded-surface bg-surface-secondary", {
  variants: {
    layout: {
      horizontal: "items-center justify-between gap-24 p-48",
      stacked: "flex-col items-start gap-16 p-24",
      responsive: RESPONSIVE.root,
    },
  },
});

const TEXT_CLASS = { horizontal: "w-676", stacked: "", responsive: RESPONSIVE.text } as const;
const TITLE_CLASS = {
  horizontal: "text-headline-sm",
  stacked: "text-title-lg",
  responsive: RESPONSIVE.title,
} as const;

export type CtaBandLayout = keyof typeof TITLE_CLASS;

export const CTA_BAND_DEFAULTS = { layout: "responsive", headingLevel: 2 } as const;

export type CtaBandAction = BandActionProps;

export interface CtaBandProps {
  /** Figma `Title Text` (under six words). */
  title: ReactNode;
  /** Figma `Body Text`. */
  children?: ReactNode;
  /** Figma `Primary Action`: the one main next step. */
  primaryAction: CtaBandAction;
  /** Figma `Secondary Action` (`Show Secondary Action`). */
  secondaryAction?: CtaBandAction;
  /** Figma `Layout`, plus Responsive (Stacked below `desktop:`). */
  layout?: CtaBandLayout;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function CtaBand({
  title,
  children,
  primaryAction,
  secondaryAction,
  layout = CTA_BAND_DEFAULTS.layout,
  headingLevel = CTA_BAND_DEFAULTS.headingLevel,
  className,
}: CtaBandProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section className={cn(ctaBandVariants({ layout }), className)}>
      <div className={cn("flex min-w-0 flex-col gap-8", TEXT_CLASS[layout])}>
        <Heading className={cn("text-text-primary", TITLE_CLASS[layout])}>{title}</Heading>
        {children && <div className="text-body-md text-text-secondary">{children}</div>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-8">
        <BandAction variant="filled" {...primaryAction} />
        {secondaryAction && <BandAction variant="outline" {...secondaryAction} />}
      </div>
    </section>
  );
}
