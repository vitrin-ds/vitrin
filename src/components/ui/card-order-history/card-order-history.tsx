import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import NextLink from "next/link";
import { cn } from "@/lib/cn";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import type { OrderStatus } from "@/lib/api/types/orders";
import { formatMoney } from "@/lib/format/money";
import { Chip } from "../chip/chip";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { Image } from "../image/image";
import { formatOrderDate, type OrderDateValue } from "../order-tracking/format-order-date";

// Figma `Card.OrderHistory` (State × Type) on `.Base.Card.OrderHistory`: padding 16, gap 8. Top:
// order no & date (body-small, text-accent) over the shipping address / title (label-large,
// text-primary), the keyboard_arrow_right affordance on the right; then the product thumbnails
// (48px circles, surface-neutral, 1px border-default, overlapping by 20, at most five) and
// "+ N Products" (label-small, text-tertiary). Bottom (gap 24): total (title-medium) and the
// Chip [Order Status] (Light, with dot). The whole card is one link (stretched over the card from
// the order number, or the title when the order line is hidden); Hover (interactive-subtle-hover)
// and Focus (interactive-subtle-active fill and a 1px interactive-focus-ring stroke inside: all
// round on a Card, the bottom border on a List Item) are CSS states. List Item: bottom border;
// Card: radius 8, border all round. The order line and the right icon are optional (Figma Show).
// Disabled greys the content out and drops the link.

export const cardOrderHistoryVariants = cva("relative flex flex-col gap-8 p-16", {
  variants: {
    type: {
      // The bottom rule is drawn inside (::after), as Figma's inside stroke: the card keeps 182.
      list: "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px",
      card: "rounded-card inset-ring",
    },
    disabled: {
      true: "bg-surface-disabled inset-ring-border-disabled after:bg-border-disabled",
      false: [
        "bg-surface-primary inset-ring-border-neutral after:bg-border-neutral",
        "hover:bg-interactive-subtle-hover",
        "has-[a:focus-visible]:bg-interactive-subtle-active",
      ],
    },
  },
  compoundVariants: [
    {
      type: "list",
      disabled: false,
      className:
        "hover:after:bg-interactive-subtle-hover has-[a:focus-visible]:after:bg-interactive-focus-ring",
    },
    {
      type: "card",
      disabled: false,
      className:
        "hover:inset-ring-interactive-subtle-hover has-[a:focus-visible]:inset-ring-interactive-focus-ring",
    },
  ],
});

/**
 * Figma Do: "Use Chip [Order Status] to communicate delivery states". Figma 03.01 My Orders: an
 * order on its way is Warning ("In Progress"), Delivered Success, Cancelled Error, Returned Light.
 */
export const ORDER_STATUS_CHIP_COLOR = {
  confirmed: "warning",
  processing: "warning",
  shipped: "warning",
  "in-delivery": "warning",
  delivered: "success",
  cancelled: "error",
  returned: "light",
} as const satisfies Record<OrderStatus, "light" | "warning" | "success" | "error">;

/** Thumbnail slots in Figma (img-1 … img-5). */
export const CARD_ORDER_HISTORY_MAX_THUMBNAILS = 5;

export interface CardOrderHistoryLabels {
  /** Figma `Order No Text`: "#TH-48211". */
  orderNumber: (orderNumber: string) => string;
  /** Figma `Product Count Text`: the products the thumbnails don't show. */
  moreProducts: (count: number) => string;
  total: string;
  status: string;
  statuses: Record<OrderStatus, string>;
}

export const CARD_ORDER_HISTORY_LABELS: CardOrderHistoryLabels = {
  orderNumber: (orderNumber) => `#${orderNumber}`,
  moreProducts: (count) => `+ ${count} ${count === 1 ? "Product" : "Products"}`,
  total: "Total",
  status: "Status",
  statuses: {
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    "in-delivery": "In delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  },
};

export const CARD_ORDER_HISTORY_DEFAULTS = {
  type: "list",
  headingLevel: 3,
  locale: "en",
} as const;

export interface CardOrderHistoryProduct {
  /** Names the thumbnail when its image is missing or has no alt. */
  name: string;
  image?: ImageAsset;
}

export interface CardOrderHistoryProps {
  /** The order detail page; the whole card links there. */
  href: string;
  /** Figma `Show Order No & Date` + `Order No Text` (with `date`). */
  orderNumber?: string;
  /** Figma `Order Date Text`: the order date, formatted with Intl. */
  date?: OrderDateValue;
  /** Figma `Address & Title Text`: shipping address or order title. */
  title: string;
  /** Figma `Product List`: thumbnails for the first five; hidden when empty. */
  products?: readonly CardOrderHistoryProduct[];
  /** Products in the order, when more than `products` (default products.length). */
  productCount?: number;
  /** Figma `Total Price Text`. */
  total?: Money;
  /** Figma `Chip [Order Status]`. Figma Don't: don't show a total without it. */
  status?: OrderStatus;
  /** Figma `Show Right Icon` + `Right Icon`; `null` hides it. */
  rightIcon?: IconName | null;
  /** Figma `Type`: List Item (stacked rows, inside other surfaces) · Card. */
  type?: "list" | "card";
  disabled?: boolean;
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  /** IANA zone for the date; defaults to the runtime's. */
  timeZone?: string;
  labels?: CardOrderHistoryLabels;
  className?: string;
}

export function CardOrderHistory({
  href,
  orderNumber,
  date,
  title,
  products = [],
  productCount = products.length,
  total,
  status,
  rightIcon = "keyboard_arrow_right",
  type = CARD_ORDER_HISTORY_DEFAULTS.type,
  disabled = false,
  headingLevel = CARD_ORDER_HISTORY_DEFAULTS.headingLevel,
  locale = CARD_ORDER_HISTORY_DEFAULTS.locale,
  timeZone,
  labels = CARD_ORDER_HISTORY_LABELS,
  className,
}: CardOrderHistoryProps) {
  const Heading = `h${headingLevel}` as const;
  const shown = products.slice(0, CARD_ORDER_HISTORY_MAX_THUMBNAILS);
  const more = productCount - shown.length;
  // Figma `Order No & Date`: the number and the date (dd.mm.yyyy), gap 8. The space between
  // them keeps the link's name readable ("#TH-48211 27.10.2026").
  const orderLine = orderNumber !== undefined && (
    <span className="inline-flex flex-wrap gap-x-8">
      <span>{labels.orderNumber(orderNumber)}</span>{" "}
      {date !== undefined && <span>{formatOrderDate(date, "numeric", locale, timeZone)}</span>}
    </span>
  );
  const link = (children: ReactNode) =>
    disabled ? (
      children
    ) : (
      <NextLink
        href={href}
        className="rounded-4 after:absolute after:inset-0 focus-visible:outline-none"
      >
        {children}
      </NextLink>
    );

  return (
    <article
      data-card="order-history"
      className={cn("group/card", cardOrderHistoryVariants({ type, disabled }), className)}
    >
      {/* Inactive card: aria-disabled exempts its greyed text from contrast (WCAG 1.4.3); an
          article can't carry it, so a layout-free wrapper does. */}
      <div className="contents" aria-disabled={disabled || undefined}>
        <div className="flex items-center gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {orderLine && (
              <Heading
                className={cn("text-body-sm", disabled ? "text-text-disabled" : "text-text-accent")}
              >
                {link(orderLine)}
              </Heading>
            )}
            <p
              className={cn("text-label-lg", disabled ? "text-text-disabled" : "text-text-primary")}
            >
              {orderLine ? title : link(title)}
            </p>
          </div>
          {rightIcon && <Icon name={rightIcon} tone={disabled ? "disabled" : "accent"} />}
        </div>

        {shown.length > 0 && (
          <div className="flex items-center gap-12 py-8">
            <ul className="flex">
              {shown.map((product, index) => (
                <li key={`${product.name}-${index}`} className="-ml-20 first:ml-0">
                  <OrderThumb product={product} disabled={disabled} />
                </li>
              ))}
            </ul>
            {more > 0 && (
              <p
                className={cn(
                  "text-label-sm whitespace-nowrap",
                  disabled
                    ? "text-text-disabled"
                    : "text-text-tertiary group-hover/card:text-text-secondary",
                )}
              >
                {labels.moreProducts(more)}
              </p>
            )}
          </div>
        )}

        {(total || status) && (
          <div className="flex items-center justify-end gap-24">
            {total && (
              <p
                className={cn(
                  "min-w-0 flex-1 text-title-md tabular-nums",
                  disabled ? "text-text-disabled" : "text-text-primary",
                )}
              >
                <span className="sr-only">{labels.total}: </span>
                {formatMoney(total, locale)}
              </p>
            )}
            {status && (
              <p className="flex">
                <span className="sr-only">{labels.status}: </span>
                <Chip color={ORDER_STATUS_CHIP_COLOR[status]} dot>
                  {labels.statuses[status]}
                </Chip>
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function OrderThumb({
  product,
  disabled,
}: {
  product: CardOrderHistoryProduct;
  disabled: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex size-48 items-center justify-center overflow-hidden rounded-full bg-surface-neutral",
        // Figma img-1 … img-5: a 1px inside stroke in border-default, drawn above the image (an
        // outline would sit under the positioned image and disappear).
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:inset-ring",
        disabled ? "after:inset-ring-border-disabled" : "after:inset-ring-border-default",
      )}
    >
      {product.image ? (
        <Image
          src={product.image.src}
          alt={product.image.alt || product.name}
          fit="contain"
          sizes="48px"
          className="bg-surface-primary"
        />
      ) : (
        <span
          role="img"
          aria-label={product.name}
          data-placeholder
          className="size-full add-image"
        />
      )}
    </span>
  );
}
