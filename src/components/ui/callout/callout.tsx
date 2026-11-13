import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma `Callout` (Type) on `.Base.Callout` (Title · Body · Attribution), editorial highlight
// blocks on the callout-* component tokens:
// - Summary: accent-surface fill, 4px border-emphasis on the left, right corners 16, padding 24,
//   gap 12; title title-medium, body body-medium (bullets 20 apart), optional attribution.
// - Tip: accent-outline border all round, radius 16, padding 20, gap 8; title title-small in
//   accent-outline-text, body body-medium in neutral-outline-text.
// - Quote: 4px border-emphasis on the left, padding 8 / 24, gap 8; the quote in headline-small,
//   attribution label-medium. Rendered as <figure> + <blockquote> + <figcaption>.
// Figma `Show Title` / `Show Attribution` are slots: shown when given.

export const calloutVariants = cva("flex flex-col text-(--th-callout-accent-surface-text)", {
  variants: {
    type: {
      summary:
        "gap-12 rounded-r-surface border-l-4 border-(--th-callout-accent-surface-border-emphasis) bg-(--th-callout-accent-surface-bg) p-24",
      tip: "gap-8 rounded-surface border border-(--th-callout-accent-outline-border) bg-(--th-callout-accent-outline-bg) p-20",
      quote: "gap-8 border-l-4 border-(--th-callout-accent-surface-border-emphasis) py-8 pl-24",
    },
  },
});

const TITLE_CLASS = {
  summary: "text-title-md",
  tip: "text-title-sm text-(--th-callout-accent-outline-text)",
} as const;

const BODY_CLASS = {
  summary: "text-body-md",
  tip: "text-body-md text-(--th-callout-neutral-outline-text)",
} as const;

export const CALLOUT_DEFAULTS = { type: "summary" } as const;

type CalloutType = "summary" | "tip" | "quote";

interface CalloutBaseProps {
  /** Figma `Attribution Text`: the named source (Figma Don't: no Quote without one). */
  attribution?: ReactNode;
  className?: string;
}

interface CalloutTitledProps extends CalloutBaseProps {
  /** Figma `Type`: Summary (key takeaways) · Tip (expert tip). */
  type?: "summary" | "tip";
  /** Figma `Title Text`, e.g. "Key takeaways". */
  title?: ReactNode;
  /**
   * Renders the title as a heading. Leave it out for a plain label; give it (with `titleId`) when
   * the title is an article section, e.g. a Summary that the TableOfContents links to.
   */
  headingLevel?: 2 | 3 | 4;
  /** Anchor id on the title (TableOfContents target). */
  titleId?: string;
  /** Figma `Body Text` as bullet lines (Summary: 3–5 lines). Rendered as a list. */
  items?: readonly ReactNode[];
  /** Figma `Body Text` as free content, after `items`. */
  children?: ReactNode;
}

interface CalloutQuoteProps extends CalloutBaseProps {
  /** Figma `Type=Quote`: a pull quote. */
  type: "quote";
  /** The quoted words (Figma `Body Text`), without the quotation marks. */
  children: ReactNode;
  /** Source URL of the quote (`<blockquote cite>`). */
  cite?: string;
  title?: never;
  items?: never;
  headingLevel?: never;
  titleId?: never;
}

export type CalloutProps = CalloutTitledProps | CalloutQuoteProps;

export function Callout(props: CalloutProps) {
  const type: CalloutType = props.type ?? CALLOUT_DEFAULTS.type;
  if (props.type === "quote") {
    return (
      <figure className={cn(calloutVariants({ type }), props.className)}>
        <blockquote cite={props.cite} className="text-headline-sm">
          <p>&ldquo;{props.children}&rdquo;</p>
        </blockquote>
        {props.attribution && (
          <figcaption className="text-label-md">{props.attribution}</figcaption>
        )}
      </figure>
    );
  }

  const { title, headingLevel, titleId, items, children, className } = props;
  const kind = type as "summary" | "tip";
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  return (
    <div className={cn(calloutVariants({ type }), className)}>
      {title && (
        <Title id={titleId} className={TITLE_CLASS[kind]}>
          {title}
        </Title>
      )}
      {items && items.length > 0 && (
        <ul className={cn("flex list-disc flex-col gap-20 pl-20", BODY_CLASS[kind])}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {children && <div className={BODY_CLASS[kind]}>{children}</div>}
      {props.attribution && <p className="text-label-md">{props.attribution}</p>}
    </div>
  );
}
