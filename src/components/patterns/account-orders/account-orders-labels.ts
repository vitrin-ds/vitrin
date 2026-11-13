import type { OrderStatus } from "@/lib/api/types/orders";

// UI strings of the account-orders block (03.01 My Orders): the search, the status filters, the
// date sort, Show More and the empty states. British English placeholder copy; pass `labels` to
// translate. The site's ORDERS_LABELS spreads these.

export const ACCOUNT_ORDERS_LABELS = {
  search: "Search for Orders",
  filters: "Filter orders by status",
  tabs: {
    all: "All",
    active: "In Progress",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  },
  /** The mobile status chip: the current status, then "filter" for the name. */
  filterName: (status: string) => `${status}, filter orders by status`,
  reset: "Reset",
  apply: "Apply",
  sort: "Date",
  sortName: (newestFirst: boolean) =>
    `Date, ${newestFirst ? "newest first" : "oldest first"}. Change the order`,
  showMore: "Show More",
  noMatchesTitle: "No orders match your search",
  noMatchesBody: "Try an order number or a product name.",
  emptyTitle: "No orders here",
  emptyBody: "Orders with this status will show up here.",
  noOrdersTitle: "No orders yet",
  noOrdersBody: "When you make an order, it’ll show up here.",
  startShopping: "Start shopping",
};

/** Which statuses each orders tab shows. */
export const ORDER_FILTERS: Record<
  keyof typeof ACCOUNT_ORDERS_LABELS.tabs,
  readonly OrderStatus[]
> = {
  all: ["confirmed", "processing", "shipped", "in-delivery", "delivered", "cancelled", "returned"],
  active: ["confirmed", "processing", "shipped", "in-delivery"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
  returned: ["returned"],
};

export type AccountOrdersLabels = typeof ACCOUNT_ORDERS_LABELS;
