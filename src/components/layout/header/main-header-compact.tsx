import NextLink from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";
import type { IconName } from "@/components/ui/icon/icon-names";

// Figma `Main Header [Compact]` (30802:12686) on `.Base Main Header [Compact]`: the header of
// focused conversion flows (01 Login, 02 Register, Forgot password). surface-primary, padding
// 16 · 52 from 1024px (16 all round below), 52px tall. Left: the `.Asset Main Header [Compact]
// Item` back link (arrow_back + "Back" in label-medium, upper case; the label hides below 744px
// like Figma Mobile). Right: icon-only items 24 apart (store locator …), each with a name and a
// 44px hit area. The flows' frames hide the component's logo and account item, so neither is
// rendered here.

export interface MainHeaderCompactProps {
  /** The back link: where "Back" goes. Figma `Show Item [Back]`: leave it out to hide the link. */
  backHref?: string;
  /** Visible label (and accessible name) of the back link. */
  backLabel?: string;
  /** Figma `Right`: MainHeaderCompactAction items. */
  actions?: ReactNode;
  className?: string;
}

/** Icon controls on surface-primary: icon-primary glyph, 44px hit area, global focus ring. */
const ITEM_CLASS =
  "relative flex items-center gap-4 rounded-4 text-text-primary before:absolute before:-inset-12";

export function MainHeaderCompact({
  backHref,
  backLabel,
  actions,
  className,
}: MainHeaderCompactProps) {
  return (
    <div className={cn("bg-surface-primary", className)}>
      <div className="mx-auto flex max-w-(--breakpoint-wide) items-center justify-between gap-12 p-16 desktop:px-52">
        {backHref && (
          <NextLink href={backHref} className={cn(ITEM_CLASS, "group/back")}>
            <Icon name="arrow_back" tone="primary" weight={200} fill={false} />
            <span className="sr-only text-label-md uppercase group-hover/back:underline group-focus-visible/back:underline tablet:not-sr-only">
              {backLabel}
            </span>
          </NextLink>
        )}
        {actions && <ul className="ml-auto flex items-center justify-end gap-24">{actions}</ul>}
      </div>
    </div>
  );
}

export interface MainHeaderCompactActionProps {
  /** Figma `Left Icon`. */
  icon: IconName;
  /** Figma `Label Text`; always the accessible name. */
  label: string;
  /** Figma `Show Label`: shows `label` from 744px (the flows' items are icon only). */
  showLabel?: boolean;
  /** Figma `Show Right Icon`: keyboard_arrow_down after the label. */
  chevron?: boolean;
  href: string;
}

/** Figma `.Asset Main Header Item` inside Main Header [Compact]: an icon-only link. */
export function MainHeaderCompactAction({
  icon,
  label,
  showLabel = false,
  chevron = false,
  href,
}: MainHeaderCompactActionProps) {
  return (
    <li className="flex">
      <NextLink href={href} aria-label={label} className={ITEM_CLASS}>
        <Icon name={icon} tone="primary" weight={200} fill={false} />
        {showLabel && (
          <span aria-hidden className="hidden text-label-md tablet:inline">
            {label}
          </span>
        )}
        {chevron && <Icon name="keyboard_arrow_down" tone="primary" weight={200} fill={false} />}
      </NextLink>
    </li>
  );
}
