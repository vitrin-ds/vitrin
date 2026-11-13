"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import { Toggle } from "../toggle/toggle";
import type { IconName } from "../icon/icon-names";

// Figma `Accordion` (State × Usage) on `.Base Accordion`, as the WAI-ARIA APG accordion: the
// header is a button (aria-expanded, aria-controls) inside a heading; the panel is a region
// labelled by it. Optional top bar (success band, title-small), 38px thumb, 20px left icon,
// title (title-small) + subtitle (body-small), and the add / remove indicator (icon-primary /
// icon-accent: it shows the control's state, so it needs 3:1). Collapsed: 1px
// border-neutral; Hover: border interactive-subtle-hover; Expanded: surface-secondary with a 2px
// interactive-subtle-active border. Full Width draws the border at the bottom only, Card all
// round with radius 12. Focus is the global ring (Figma draws no focus state).
// Tone On Accent (Figma mobile Footer 31418:4041, Full Width on surface-accent-strong): no fill of
// its own, a 1px border-accent rule (2px interactive-subtle-active when expanded), title, panel
// and indicator in text-on-accent / icon-on-accent.

export const accordionVariants = cva("", {
  variants: {
    usage: {
      full: "border-b",
      card: "rounded-12 inset-ring",
      // The last section of a card (Card.Gift / Card.Coupon): a 1px rule drawn inside its top edge
      // (Figma keeps the section 52 tall), the card's corners below.
      inset:
        "relative rounded-b-8 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border-neutral",
    },
    tone: { default: "bg-surface-primary", "on-accent": "" },
    expanded: { true: "", false: "" },
  },
  compoundVariants: [
    { tone: "default", usage: "full", className: "border-border-neutral" },
    { tone: "default", usage: "card", className: "inset-ring-border-neutral" },
    { tone: "default", expanded: true, className: "bg-surface-secondary" },
    { tone: "on-accent", usage: "full", className: "border-border-accent" },
    { tone: "on-accent", usage: "card", className: "inset-ring-border-accent" },
    { usage: "full", expanded: false, className: "hover:border-interactive-subtle-hover" },
    { usage: "card", expanded: false, className: "hover:inset-ring-interactive-subtle-hover" },
    { usage: "full", expanded: true, className: "border-b-2 border-interactive-subtle-active" },
    {
      usage: "card",
      expanded: true,
      className: "inset-ring-2 inset-ring-interactive-subtle-active",
    },
  ],
});

export const ACCORDION_DEFAULTS = {
  usage: "full",
  tone: "default",
  headingLevel: 3,
} as const;

export interface AccordionProps {
  /** Figma `Title Text`. */
  title: string;
  /** Figma `Subtitle Text`: preview context for the collapsed state. */
  subtitle?: string;
  /** Figma `Left Icon` (20px, icon-accent). Decorative; should reinforce the content category. */
  leftIcon?: IconName;
  /** Figma `Thumb Icon`: a 20px icon in a 38px neutral tile. Decorative. */
  thumbIcon?: IconName;
  /** Figma `Show Thumb` with `Show Thumb Icon=false`: the tile without an icon. */
  thumb?: boolean;
  /**
   * Figma `Right Icon`: a fixed glyph in place of `indicator`'s, beside a Toggle too. `null` is
   * `Show Right Icon=false`. The header still opens the panel.
   */
  rightIcon?: IconName | null;
  /** Figma `Accordion Top Bar` text (success band above the header). */
  topBar?: string;
  /** Figma top bar icon (20px, icon-success). Decorative. */
  topBarIcon?: IconName;
  /** Figma `Usage`: Full Width for stacked FAQ sections, Card for standalone panels. */
  usage?: NonNullable<VariantProps<typeof accordionVariants>["usage"]>;
  /**
   * The header's control: add / remove, Figma's chevron on a card's section, or a Toggle in
   * `Right` (03.02 "Also use this address for invoicing"): the switch alone opens the panel, and
   * without children it is a boxed switch. Controlled: pass `open` and `onOpenChange`.
   */
  indicator?: "sign" | "chevron" | "toggle";
  /** Default on page surfaces; On Accent on surface-accent-strong (mobile Footer). */
  tone?: NonNullable<VariantProps<typeof accordionVariants>["tone"]>;
  /** Heading level of the header, to fit the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Figma `Accordion Panel` slot. */
  children?: ReactNode;
  className?: string;
}

export function Accordion({
  indicator = "sign",
  title,
  subtitle,
  leftIcon,
  thumbIcon,
  thumb = false,
  rightIcon,
  topBar,
  topBarIcon,
  usage = ACCORDION_DEFAULTS.usage,
  tone = ACCORDION_DEFAULTS.tone,
  headingLevel = ACCORDION_DEFAULTS.headingLevel,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: AccordionProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const Heading = `h${headingLevel}` as const;
  const onAccent = tone === "on-accent";
  const hasPanel = children != null;

  const leading = (
    <>
      {(thumb || thumbIcon) && (
        <span className="flex size-36 shrink-0 items-center justify-center rounded-4 bg-surface-neutral inset-ring inset-ring-border-neutral">
          {thumbIcon && <Icon name={thumbIcon} tone="primary" />}
        </span>
      )}
      {leftIcon && <Icon name={leftIcon} tone="accent" />}
    </>
  );

  function toggle() {
    if (openProp === undefined) setUncontrolled(!open);
    onOpenChange?.(!open);
  }

  return (
    <div className={cn(accordionVariants({ usage, tone, expanded: open && hasPanel }), className)}>
      {topBar && (
        <p
          className={cn(
            "flex items-center gap-4 bg-bg-success px-16 py-8 text-title-sm text-text-success",
            usage === "card" && "rounded-t-12",
          )}
        >
          {topBarIcon && <Icon name={topBarIcon} tone="success" />}
          {topBar}
        </p>
      )}
      {indicator === "toggle" ? (
        <div className="flex items-center gap-12 p-16">
          {leading}
          <span className="flex min-w-0 flex-1 flex-col gap-4">
            <Heading id={`${id}-header`} className="text-title-sm text-text-primary">
              {title}
            </Heading>
            {subtitle && <span className="text-body-sm text-text-tertiary">{subtitle}</span>}
          </span>
          {rightIcon && <Icon name={rightIcon} tone="primary" />}
          <Toggle
            label={title}
            hideLabel
            checked={open}
            aria-controls={hasPanel ? `${id}-panel` : undefined}
            onChange={toggle}
          />
        </div>
      ) : (
        <Heading>
          <button
            type="button"
            id={`${id}-header`}
            aria-expanded={open}
            aria-controls={`${id}-panel`}
            onClick={toggle}
            className={cn(
              "flex w-full cursor-pointer items-center gap-12 p-16 text-left",
              usage === "card" && !topBar && "rounded-t-12",
              usage === "card" && !open && "rounded-b-12",
            )}
          >
            {leading}
            <span className="flex min-w-0 flex-1 flex-col gap-4">
              <span
                className={cn(
                  "text-title-sm",
                  onAccent ? "text-text-on-accent" : "text-text-primary",
                )}
              >
                {title}
              </span>
              {subtitle && (
                <span
                  className={cn(
                    "text-body-sm",
                    onAccent ? "text-text-on-accent" : "text-text-tertiary",
                  )}
                >
                  {subtitle}
                </span>
              )}
            </span>
            {rightIcon === null ? null : rightIcon ? (
              <Icon name={rightIcon} tone={onAccent ? "on-accent" : "primary"} />
            ) : indicator === "chevron" ? (
              <Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} tone="accent" />
            ) : (
              <Icon
                name={open ? "remove" : "add"}
                tone={onAccent ? "on-accent" : open ? "accent" : "primary"}
              />
            )}
          </button>
        </Heading>
      )}
      {hasPanel && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-header`}
          hidden={!open}
          className={cn(
            "px-16 pb-16 text-body-md",
            onAccent ? "text-text-on-accent" : "text-text-tertiary",
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
