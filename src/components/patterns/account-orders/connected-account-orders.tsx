"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/api/types/orders";
import type { OrderAdapter } from "@/lib/commerce/commerce-adapter";
import { AccountOrders, type AccountOrdersProps } from "./account-orders";

// The account-orders block on a data contract: give it the orders part of a CommerceAdapter
// (mock, Shopify …) and it reads the signed-in customer's orders by itself. A failed read shows
// the empty list and goes to `onError`.

export interface ConnectedAccountOrdersProps extends Omit<AccountOrdersProps, "orders"> {
  adapter: Pick<OrderAdapter, "listOrders">;
  onError: (error: unknown) => void;
}

export function ConnectedAccountOrders({
  adapter,
  onError,
  ...props
}: ConnectedAccountOrdersProps) {
  const [orders, setOrders] = useState<Order[] | undefined>(undefined);

  useEffect(() => {
    let live = true;
    adapter.listOrders().then(
      (list) => live && setOrders(list),
      (error: unknown) => {
        if (!live) return;
        setOrders([]);
        onError(error);
      },
    );
    return () => {
      live = false;
    };
    // Read once per adapter; onError is a callback, not an input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter]);

  return <AccountOrders {...props} orders={orders} />;
}
