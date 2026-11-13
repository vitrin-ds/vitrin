import { cn } from "@/lib/cn";
import { ButtonLink } from "../button/button";
import { Icon } from "../icon/icon";

// Figma `Card.OrderHistory.Empty`: replaces the order list when there are no orders. Card
// (surface-primary, 1px border-neutral, radius 8, padding 40, gap 20, centred): a decorative
// illustration (shopping_bag_speed over soft, blurred colour fields), the message (label-large,
// text-secondary, centred) and a Button (Filled, 216 wide) that leads to the shop. The CTA
// navigates, so it is a link styled as the Button (Figma Do: "direct users to the shop").
// Figma `Show Label` / `Show Button` are optional slots; Figma Don't: keep at least one.

export const CARD_ORDER_HISTORY_EMPTY_LABELS = {
  message: "You haven’t placed any orders yet. When you do, they’ll show up here.",
};

export interface CardOrderHistoryEmptyProps {
  /** Figma `Label Text`: friendly, guides toward a first purchase. Pass "" to hide it. */
  message?: string;
  /** Figma `Button`: a specific destination, e.g. { label: "Start shopping", href: "/" }. */
  action?: { label: string; href: string };
  className?: string;
}

export function CardOrderHistoryEmpty({
  message = CARD_ORDER_HISTORY_EMPTY_LABELS.message,
  action,
  className,
}: CardOrderHistoryEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-20 rounded-card bg-surface-primary p-40 text-center",
        "inset-ring inset-ring-border-neutral",
        className,
      )}
    >
      <EmptyIllustration />
      {message && <p className="text-label-lg text-text-secondary">{message}</p>}
      {action && (
        <ButtonLink href={action.href} size="sm" className="w-full max-w-216">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}

/** Decorative: three blurred colour fields behind a light 120px glyph (40px icon × 3). */
function EmptyIllustration() {
  return (
    <span aria-hidden className="relative flex h-200 w-full max-w-300 items-center justify-center">
      <span className="absolute top-12 left-1/2 size-124 -translate-x-3/4 rounded-full bg-surface-accent-subtle blur-xl" />
      <span className="absolute top-80 left-1/2 size-93 translate-x-0 rounded-full bg-surface-secondary blur-xl" />
      <span className="absolute top-100 left-1/2 size-77 -translate-x-1/2 rounded-full bg-bg-warning blur-xl" />
      <Icon
        name="shopping_bag_speed"
        size="xl"
        weight={200}
        fill={false}
        tone="accent"
        className="relative scale-300"
      />
    </span>
  );
}
