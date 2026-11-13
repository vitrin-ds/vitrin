import { cva } from "class-variance-authority";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";
import { Link } from "@/components/ui/link/link";
import { cn } from "@/lib/cn";

// The `Title` frame a section opens with.
// - Size Large (Home 07, e.g. New Arrivals 30198:193330): `Title & Body` (at most 666 wide, gap
//   10 → 8) with the title in headline-large text-primary and an optional body in body-medium
//   text-secondary, and `Options` on the right, bottom-aligned: one accent Link (label-large,
//   underlined) that leads to the full list ("View All", "Best Sellers", "Visit"), optionally with
//   a 20px icon after it. One standard for every section action (Figma draws a Ghost Button in
//   some frames; the shop uses the Link so these actions read as navigation everywhere).
// - Size Medium (content pages: 15.01 "Browse by topic", 11.01 Legal Centre intro, 11.03 "What we
//   stand for"; 05 Intermediary "Best Sellers In Make Up" 31100:186494): Large's layout with the
//   title in headline-small.
// - Size Small (My Account 03, WD.03.P002 `Title`): one row, centred: the title in title-medium
//   ("My Orders (4)") and the action as a Small accent Link ("View All").
// The heading is an h2 by default: the page's single h1 is above it.

export interface SectionHeaderAction {
  label: string;
  href: string;
  /** An icon after the label (PDP "View all →": arrow_forward). Large / Medium. */
  rightIcon?: IconName;
}

export const sectionHeaderVariants = cva("flex justify-between gap-8", {
  variants: {
    size: { lg: "items-end", md: "items-end", sm: "items-center" },
  },
});

const TITLE_CLASS = {
  lg: "text-headline-lg",
  md: "text-headline-sm",
  sm: "text-title-md",
} as const;

export const SECTION_HEADER_DEFAULTS = { headingLevel: 2, size: "lg" } as const;

export interface SectionHeaderProps {
  /** Figma title text; also names the section (pass `id` and `aria-labelledby` it). */
  title: string;
  /** Figma body text (`Show Body`). Sizes Large and Medium. */
  description?: string;
  /** Figma `Options` button (Large) or link (Small). */
  action?: SectionHeaderAction;
  /** id of the heading, for the section's `aria-labelledby`. */
  id?: string;
  headingLevel?: 2 | 3;
  /** Large: Home sections. Medium: content pages and the Intermediary. Small: account. */
  size?: "lg" | "md" | "sm";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  id,
  headingLevel = SECTION_HEADER_DEFAULTS.headingLevel,
  size = SECTION_HEADER_DEFAULTS.size,
  className,
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cn(sectionHeaderVariants({ size }), className)}>
      <div className="flex max-w-666 min-w-0 flex-col gap-8">
        <Heading id={id} className={cn("text-text-primary", TITLE_CLASS[size])}>
          {title}
        </Heading>
        {description && size !== "sm" && (
          <p className="text-body-md text-text-secondary">{description}</p>
        )}
      </div>
      {/* Several sections say "View All": the heading describes which list it opens. */}
      {action && size !== "sm" && (
        <Link
          href={action.href}
          aria-describedby={id}
          className={cn("shrink-0", action.rightIcon && "inline-flex items-center gap-4")}
        >
          {action.label}
          {action.rightIcon && <Icon name={action.rightIcon} tone="current" />}
        </Link>
      )}
      {action && size === "sm" && (
        <Link href={action.href} size="sm" aria-describedby={id} className="shrink-0">
          {action.label}
        </Link>
      )}
    </div>
  );
}
