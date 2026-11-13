import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { Money } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { Icon } from "@/components/ui/icon/icon";
import { Text } from "@/components/ui/text/text";

// Figma `ActionBar.Bottom` (State Default · Expanded) on `.Base.ActionBar.Bottom`; used fixed in
// WM.09.03.* Checkout and the cart. Top row 62px, padding 0 · 16, gap 12:
// - Left (gap 8): Thumbnail 44 (surface-neutral, 1px border-neutral, r-8), then an 88px column
//   with the Overline (label-xsmall, text-accent), Main Text (title-medium) and Secondary Text
//   (label-small, text-tertiary); then the Toggle Option chevron (20px, icon-accent), up when
//   collapsed, down when expanded.
// - Right (gap 8, pushed right): Button [Secondary] and Button [Primary], both filling.
// Under it the 12px Spacer for the home indicator. Surface: surface-primary, surface-secondary
// when expanded; no shadow (Figma). It's a labelled region, so screen-reader users can find the
// action and the total.

export const bottomActionBarVariants = cva("z-20 flex flex-col", {
  variants: {
    position: {
      /** Fixed to the bottom of the viewport (pages). The page keeps its end clear of it. */
      fixed: "fixed inset-x-0 bottom-0",
      /** In the flow (stories, docs). */
      static: "relative",
    },
    /** Figma `State`: Expanded while the Toggle Option has the extra content open. */
    expanded: { false: "bg-surface-primary", true: "bg-surface-secondary" },
    /** Figma `Show Spacer`: 12px under the bar for devices with a home indicator. */
    spacer: { true: "pb-12", false: "" },
  },
});

export const BOTTOM_ACTION_BAR_DEFAULTS = {
  position: "fixed",
  spacer: true,
  locale: "en",
} as const;

export interface BottomActionBarProps {
  /** Names the region, e.g. "Order total". */
  label: string;
  /** Figma `Main Text`: the price. */
  price?: Money;
  /** Figma `Overline Text`: context above the price, e.g. "2 items selected". */
  overline?: ReactNode;
  /** Figma `Secondary Text`: a line under the price, e.g. "Incl. VAT". */
  secondaryText?: ReactNode;
  /** Figma `Thumbnail`: a 44px image, e.g. the product on a product page. */
  thumbnail?: ReactNode;
  /**
   * Figma `Show Toggle Option` + `State`: the chevron that opens extra content (quantity,
   * variants). `expanded` turns the bar to Figma's Expanded state.
   */
  toggle?: { expanded: boolean; onToggle: () => void; label: string };
  /** Figma `Button [Primary]`: a Button or ButtonLink (Medium). */
  primaryAction?: ReactNode;
  /** Figma `Button [Secondary]`: an Outline Button (Medium). */
  secondaryAction?: ReactNode;
  /** Figma `Show Spacer`. */
  spacer?: boolean;
  position?: NonNullable<VariantProps<typeof bottomActionBarVariants>["position"]>;
  locale?: string;
  /** Visibility only (e.g. `desktop:hidden`); the look comes from the variants. */
  className?: string;
}

function ToggleOption({ expanded, onToggle, label }: NonNullable<BottomActionBarProps["toggle"]>) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={label}
      onClick={onToggle}
      className="relative flex shrink-0 cursor-pointer rounded-4 before:absolute before:-inset-12 focus-visible:bg-interactive-subtle-hover"
    >
      <Icon name={expanded ? "keyboard_arrow_down" : "keyboard_arrow_up"} weight={400} />
    </button>
  );
}

export function BottomActionBar({
  label,
  price,
  overline,
  secondaryText,
  thumbnail,
  toggle,
  primaryAction,
  secondaryAction,
  spacer = BOTTOM_ACTION_BAR_DEFAULTS.spacer,
  position = BOTTOM_ACTION_BAR_DEFAULTS.position,
  locale = BOTTOM_ACTION_BAR_DEFAULTS.locale,
  className,
}: BottomActionBarProps) {
  const hasText = overline !== undefined || price !== undefined || secondaryText !== undefined;
  const hasLeft = hasText || thumbnail !== undefined || toggle !== undefined;
  return (
    <section
      aria-label={label}
      className={cn(
        bottomActionBarVariants({ position, spacer, expanded: toggle?.expanded ?? false }),
        className,
      )}
    >
      <div className="flex h-62 items-center gap-12 px-16">
        {hasLeft && (
          <div className="flex shrink-0 items-center gap-8">
            {thumbnail && (
              <div className="flex size-44 shrink-0 overflow-hidden rounded-8 bg-surface-neutral inset-ring inset-ring-border-neutral">
                {thumbnail}
              </div>
            )}
            {hasText && (
              <div className="flex w-88 flex-col justify-center">
                {overline !== undefined && (
                  <Text variant="label-xs" tone="accent" className="truncate">
                    {overline}
                  </Text>
                )}
                {price && (
                  <Text variant="title-md" numeric>
                    {formatMoney(price, locale)}
                  </Text>
                )}
                {secondaryText !== undefined && (
                  <Text variant="label-sm" tone="tertiary" numeric>
                    {secondaryText}
                  </Text>
                )}
              </div>
            )}
            {toggle && <ToggleOption {...toggle} />}
          </div>
        )}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-1 items-center justify-end gap-8 *:flex-1">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </section>
  );
}
