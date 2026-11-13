import type { Address } from "@/lib/api/types/customer";
import type { Order } from "@/lib/api/types/orders";
import { formatAddressLines } from "@/lib/format/address";
import { ORDER_FILTERS } from "./account-orders-labels";

// Pure helpers of the account-orders block (03.01 My Orders): the status filter, the search,
// the date sort, the day groups and the Card.OrderHistory props. Unit-tested through the site's
// account-view tests.

export const ACCOUNT_ORDERS_LOCALE = "en-GB";

export type OrderFilter = keyof typeof ORDER_FILTERS;

export function ordersFor(orders: readonly Order[], filter: OrderFilter): Order[] {
  const statuses = ORDER_FILTERS[filter];
  return orders.filter((order) => statuses.includes(order.status));
}

/** Orders whose number or one of whose products matches the search (case-insensitive). */
export function searchOrders(
  orders: readonly Order[],
  query: string,
  locale = ACCOUNT_ORDERS_LOCALE,
): Order[] {
  const needle = query.trim().toLocaleLowerCase(locale);
  if (!needle) return [...orders];
  return orders.filter(
    (order) =>
      order.number.toLocaleLowerCase(locale).includes(needle) ||
      order.lines.some((line) => line.name.toLocaleLowerCase(locale).includes(needle)),
  );
}

/** By the date placed: newest first, or oldest first. */
export function sortOrders(orders: readonly Order[], newestFirst: boolean): Order[] {
  return [...orders].sort((a, b) =>
    newestFirst ? b.placedAt.localeCompare(a.placedAt) : a.placedAt.localeCompare(b.placedAt),
  );
}

export interface OrderDayGroup {
  /** The calendar day, YYYY-MM-DD (UTC). */
  day: string;
  /** Figma Date Group title, e.g. "Jan 05". */
  label: string;
  orders: Order[];
}

/** Consecutive orders of one day under one title (Figma 03.01 Order List › Date Group). */
export function groupOrdersByDay(
  orders: readonly Order[],
  locale = ACCOUNT_ORDERS_LOCALE,
): OrderDayGroup[] {
  // Month first, as Figma draws it ("Jan 05"), in the locale's month names.
  const format = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
  const label = (iso: string) => {
    const parts = format.formatToParts(new Date(iso));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? "";
    return `${part("month")} ${part("day")}`;
  };
  const groups: OrderDayGroup[] = [];
  for (const order of orders) {
    const day = order.placedAt.slice(0, 10);
    const last = groups.at(-1);
    if (last?.day === day) last.orders.push(order);
    else groups.push({ day, label: label(order.placedAt), orders: [order] });
  }
  return groups;
}

/** "Jane Doe, Lindenstraße 12, 2nd floor, 10969 Berlin, Germany" (Figma "Default: …"). */
export function addressSummary(address: Address, locale = ACCOUNT_ORDERS_LOCALE): string {
  return [`${address.firstName} ${address.lastName}`, ...formatAddressLines(address, locale)].join(
    ", ",
  );
}

/** Card.OrderHistory props for an order (Figma WD.03.P002 Order List). */
export function orderCardProps(order: Order, href: string, locale = ACCOUNT_ORDERS_LOCALE) {
  return {
    locale,
    href,
    orderNumber: order.number,
    date: order.placedAt,
    title: addressSummary(order.shippingAddress, locale),
    products: order.lines.map((line) => ({ name: line.name, image: line.image })),
    total: order.total,
    status: order.status,
  } as const;
}
