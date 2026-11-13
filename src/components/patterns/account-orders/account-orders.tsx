"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet";
import { Button } from "@/components/ui/button/button";
import { CardOrderHistory } from "@/components/ui/card-order-history/card-order-history";
import { Chip } from "@/components/ui/chip/chip";
import { EmptyState } from "@/components/ui/empty-state/empty-state";
import { Radio, RadioGroup } from "@/components/ui/radio/radio";
import { Skeleton } from "@/components/ui/skeleton/skeleton";
import { TextInput } from "@/components/ui/text-input/text-input";
import type { Order } from "@/lib/api/types/orders";
import {
  ACCOUNT_ORDERS_LOCALE,
  groupOrdersByDay,
  orderCardProps,
  ordersFor,
  searchOrders,
  sortOrders,
  type OrderFilter,
} from "./account-orders-helpers";
import { ACCOUNT_ORDERS_LABELS, type AccountOrdersLabels } from "./account-orders-labels";

// 03.01 My Orders (Figma WD 30844:260465 · WM 30844:259503), the list under the page header.
// From the top, 32 apart: the search (Text Input Medium, no title: order number or product name),
// then the list (gap 20): the status chips (Chip Light with the dot, the current one Selected; one
// at a time, toggle buttons in a group) with the Date chip on the right (newest / oldest first),
// and the Date Groups (40 apart: the day in title-large over its Card.OrderHistory cards, gap 8),
// then Show More (Button Outline Large with add) while more orders are left. Filtering, sorting
// and searching start from the first page again. Below 744px (WM) the status row is one chip, the
// current status with instant_mix, that opens a Half Bottom Sheet of radios with Reset + Apply:
// the choice is a draft until Apply. Lay it out in a column with gap 32 (the account page does).

export interface AccountOrdersProps {
  /** The customer's orders; undefined while they load (a skeleton shows). */
  orders: readonly Order[] | undefined;
  /** The order detail page of an order. */
  orderHref: (order: Order) => string;
  /** Where "Start shopping" goes when there are no orders. */
  shopHref?: string;
  /** Orders shown before Show More, and how many each press adds. */
  pageSize?: number;
  locale?: string;
  labels?: AccountOrdersLabels;
}

/** Figma 03.01 shows six orders before Show More. */
export const ACCOUNT_ORDERS_DEFAULTS = {
  shopHref: "/",
  pageSize: 6,
  locale: ACCOUNT_ORDERS_LOCALE,
} as const;

export function AccountOrders({
  orders,
  orderHref,
  shopHref = ACCOUNT_ORDERS_DEFAULTS.shopHref,
  pageSize = ACCOUNT_ORDERS_DEFAULTS.pageSize,
  locale = ACCOUNT_ORDERS_DEFAULTS.locale,
  labels: L = ACCOUNT_ORDERS_LABELS,
}: AccountOrdersProps) {
  const filters = Object.keys(L.tabs) as OrderFilter[];
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [shown, setShown] = useState(pageSize);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<OrderFilter>("all");

  if (orders === undefined) {
    return (
      <div className="h-480" aria-busy="true">
        <Skeleton shape="block" />
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt_long"
        title={L.noOrdersTitle}
        body={L.noOrdersBody}
        primaryAction={{ label: L.startShopping, href: shopHref }}
      />
    );
  }

  const matching = sortOrders(searchOrders(ordersFor(orders, filter), query, locale), newestFirst);
  const groups = groupOrdersByDay(matching.slice(0, shown), locale);

  function reset<T>(set: (value: T) => void) {
    return (value: T) => {
      set(value);
      setShown(pageSize);
    };
  }

  return (
    <>
      <TextInput
        type="search"
        label={L.search}
        hideLabel
        placeholder={L.search}
        leftIcon="search"
        value={query}
        onChange={(event) => reset(setQuery)(event.currentTarget.value)}
      />
      <div className="flex flex-col gap-20">
        <div className="flex items-start justify-between gap-12">
          <Chip
            color="light"
            rightIcon="instant_mix"
            aria-label={L.filterName(L.tabs[filter])}
            onClick={() => {
              setDraft(filter);
              setSheetOpen(true);
            }}
            className="tablet:hidden"
          >
            {L.tabs[filter]}
          </Chip>
          <div role="group" aria-label={L.filters} className="hidden flex-wrap gap-12 tablet:flex">
            {filters.map((key) => (
              <Chip key={key} dot pressed={filter === key} onClick={() => reset(setFilter)(key)}>
                {L.tabs[key]}
              </Chip>
            ))}
          </div>
          <Chip
            color="light"
            rightIcon={newestFirst ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            aria-label={L.sortName(newestFirst)}
            onClick={() => reset(setNewestFirst)(!newestFirst)}
            className="shrink-0"
          >
            {L.sort}
          </Chip>
        </div>
        {groups.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title={query.trim() ? L.noMatchesTitle : L.emptyTitle}
            body={query.trim() ? L.noMatchesBody : L.emptyBody}
          />
        ) : (
          <div className="flex flex-col gap-40">
            {groups.map((group) => (
              <section key={group.day} aria-labelledby={`orders-${group.day}`}>
                <h2 id={`orders-${group.day}`} className="pb-8 text-title-lg text-text-primary">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-8">
                  {group.orders.map((order) => (
                    <li key={order.id}>
                      <CardOrderHistory
                        {...orderCardProps(order, orderHref(order), locale)}
                        type="card"
                        headingLevel={3}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {matching.length > shown && (
              <Button
                variant="outline"
                size="lg"
                rightIcon="add"
                onClick={() => setShown((count) => count + pageSize)}
                className="self-center"
              >
                {L.showMore}
              </Button>
            )}
          </div>
        )}
      </div>
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={L.filters}
        footer={
          <div className="flex gap-8">
            <Button variant="outline" onClick={() => setDraft("all")}>
              {L.reset}
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                reset(setFilter)(draft);
                setSheetOpen(false);
              }}
            >
              {L.apply}
            </Button>
          </div>
        }
      >
        <div className="px-16 py-16">
          <RadioGroup legend={<span className="sr-only">{L.filters}</span>}>
            {filters.map((key) => (
              <Radio
                key={key}
                name="order-status"
                value={key}
                label={L.tabs[key]}
                checked={draft === key}
                onChange={() => setDraft(key)}
              />
            ))}
          </RadioGroup>
        </div>
      </BottomSheet>
    </>
  );
}
