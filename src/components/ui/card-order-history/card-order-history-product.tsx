import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import type { OrderStatus } from "@/lib/api/types/orders";
import { formatMoney } from "@/lib/format/money";
import { Chip } from "../chip/chip";
import { Image } from "../image/image";
import { Link } from "../link/link";
import {
  CARD_ORDER_HISTORY_LABELS,
  ORDER_STATUS_CHIP_COLOR,
  type CardOrderHistoryLabels,
} from "./card-order-history";

// Figma `Card.OrderHistory.Product` (State × Type, main 30310:230994) on
// `.Base.Card.OrderHistory.Product`: one product of an order on the order detail page (03.01.01).
// Padding 16 · 16, gap 12. Status: the delivery line (title-small, text-primary; Figma
// `Estimated Delivery Date Text`) and, when given, the Chip [Order Status] on the right. Product
// (gap 12): an 80px image (radius 4, 1px border-default inside), then the name (title-small),
// the variant (body-small, text-accent) and the price (title-small), gap 8. Actions (a 1px
// border-neutral rule, padding-top 12, gap 24): label-medium accent Links (Shipment Tracking,
// Cancel Order, Return, View Return Details …). Card: radius 8 with a border-neutral ring; List
// Item: the bottom border only. States (Figma State): Hover = interactive-subtle-hover fill and a
// 2px interactive-subtle-hover stroke; Active & Focus (keyboard focus inside) =
// interactive-subtle-active fill and a 1px interactive-focus-ring stroke; Disabled (a cancelled
// item) = surface-disabled, a 2px border-disabled stroke, everything greyed out, no links. The
// More Icon (Action Menu) closes the actions row on the right. Every Show slot is optional.

export const cardOrderHistoryProductVariants = cva("flex flex-col gap-12 px-16 py-16", {
  variants: {
    type: { card: "rounded-card inset-ring", list: "border-b" },
    disabled: {
      true: "border-border-disabled bg-surface-disabled inset-ring-border-disabled",
      false: [
        "border-border-neutral bg-surface-primary inset-ring-border-neutral",
        "hover:bg-interactive-subtle-hover has-focus-visible:bg-interactive-subtle-active",
      ],
    },
  },
  compoundVariants: [
    { type: "card", disabled: true, className: "inset-ring-2" },
    { type: "list", disabled: true, className: "border-b-2" },
    {
      type: "card",
      disabled: false,
      className:
        "hover:inset-ring-2 hover:inset-ring-interactive-subtle-hover has-focus-visible:inset-ring-1 has-focus-visible:inset-ring-interactive-focus-ring",
    },
    {
      type: "list",
      disabled: false,
      className:
        "hover:border-b-2 hover:border-interactive-subtle-hover has-focus-visible:border-b has-focus-visible:border-interactive-focus-ring",
    },
  ],
});

export const CARD_ORDER_HISTORY_PRODUCT_DEFAULTS = {
  type: "card",
  headingLevel: 3,
  locale: "en",
} as const;

export interface CardOrderHistoryProductAction {
  label: string;
  href: string;
}

export interface CardOrderHistoryProductProps {
  /** Figma `Show Estimated Delivery Date` + its text, e.g. "Arriving by 30.10.2026". */
  delivery?: string;
  /** Figma `Chip [Order Status]` (`Show Chip [Order Status]`). */
  status?: OrderStatus;
  /** Figma `Product Name Text`. */
  name: string;
  /** The product page; the name links there. */
  href?: string;
  /** Figma `Variant Name Text` (`Show Variant Name`). */
  variant?: string;
  /** Figma `Price Text`: the line total. */
  price: Money;
  /** Units, when more than one ("2 × €19.60"). */
  quantity?: number;
  image?: ImageAsset;
  /**
   * Figma `Show Actions` + Shipment Tracking / Cancel Order / Return / Rate & Review: links, in
   * order.
   */
  actions?: readonly CardOrderHistoryProductAction[];
  /** Figma `Show More Icon`: an Action Menu at the end of the actions row. */
  menu?: ReactNode;
  /** Figma `Type`: Card (on its own) · List Item (stacked inside another surface). */
  type?: "card" | "list";
  /** Figma `State=Disabled`: a cancelled item. */
  disabled?: boolean;
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  labels?: Pick<CardOrderHistoryLabels, "statuses"> & {
    quantity: (quantity: number, price: string) => string;
  };
  className?: string;
}

export const CARD_ORDER_HISTORY_PRODUCT_LABELS: NonNullable<
  CardOrderHistoryProductProps["labels"]
> = {
  statuses: CARD_ORDER_HISTORY_LABELS.statuses,
  quantity: (quantity, price) => `${quantity} × ${price}`,
};

export function CardOrderHistoryProduct({
  delivery,
  status,
  name,
  href,
  variant,
  price,
  quantity = 1,
  image,
  actions = [],
  menu,
  type = CARD_ORDER_HISTORY_PRODUCT_DEFAULTS.type,
  disabled = false,
  headingLevel = CARD_ORDER_HISTORY_PRODUCT_DEFAULTS.headingLevel,
  locale = CARD_ORDER_HISTORY_PRODUCT_DEFAULTS.locale,
  labels = CARD_ORDER_HISTORY_PRODUCT_LABELS,
  className,
}: CardOrderHistoryProductProps) {
  const Heading = `h${headingLevel}` as const;
  const unit = { ...price, amount: Math.round(price.amount / quantity) };
  const primary = disabled ? "text-text-disabled" : "text-text-primary";
  return (
    <article className={cn(cardOrderHistoryProductVariants({ type, disabled }), className)}>
      {/* aria-disabled exempts the greyed text from contrast (WCAG 1.4.3). */}
      <div className="contents" aria-disabled={disabled || undefined}>
        {(delivery || (status && !disabled)) && (
          <div className="flex items-center gap-12">
            <p className={cn("min-w-0 flex-1 text-title-sm", primary)}>{delivery}</p>
            {status && !disabled && (
              <Chip color={ORDER_STATUS_CHIP_COLOR[status]} dot>
                {labels.statuses[status]}
              </Chip>
            )}
          </div>
        )}
        <div className="flex items-start gap-12">
          <span
            className={cn(
              "relative size-80 shrink-0 overflow-hidden rounded-4 bg-surface-neutral",
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-4 after:inset-ring",
              disabled ? "after:inset-ring-border-disabled" : "after:inset-ring-border-default",
            )}
          >
            {image ? (
              <Image
                src={image.src}
                alt=""
                fit="contain"
                sizes="80px"
                className={cn("bg-surface-primary", disabled && "opacity-50")}
              />
            ) : (
              <span aria-hidden data-placeholder className="block size-full add-image" />
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <Heading className={cn("text-title-sm", primary)}>
              {href && !disabled ? (
                <NextLink href={href} className="rounded-4 hover:underline">
                  {name}
                </NextLink>
              ) : (
                name
              )}
            </Heading>
            {variant && (
              <p
                className={cn("text-body-sm", disabled ? "text-text-disabled" : "text-text-accent")}
              >
                {variant}
              </p>
            )}
            <p className={cn("flex h-20 items-center text-title-sm tabular-nums", primary)}>
              {quantity > 1
                ? labels.quantity(quantity, formatMoney(unit, locale))
                : formatMoney(price, locale)}
            </p>
          </div>
        </div>
        {(actions.length > 0 || menu) && !disabled && (
          <div className="relative flex items-center gap-24 pt-12 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border-neutral">
            {actions.length > 0 && (
              <ul className="flex flex-wrap gap-24">
                {actions.map((action) => (
                  <li key={action.label} className="flex">
                    {/* These open a sheet over the order: the page stays where it is. */}
                    <Link href={action.href} scroll={false} size="sm">
                      {action.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {menu && <div className="ml-auto flex">{menu}</div>}
          </div>
        )}
      </div>
    </article>
  );
}
