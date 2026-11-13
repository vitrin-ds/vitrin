"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cart } from "@/lib/api/types/cart";
import { optimisticCart, type CartChange } from "@/lib/shop/optimistic-cart";
import type { CartAdapter } from "./cart-adapter";

export interface UseCartOptions {
  /** A read or a change failed. The cart is back as it was: tell the customer (e.g. a Toast). */
  onError: (error: unknown) => void;
}

export interface UseCartResult {
  /** Null until the first read answers. */
  cart: Cart | null;
  setLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  /**
   * A change with no optimistic guess (a coupon, adding a line): the cart follows the backend's
   * answer. Rejects with the adapter's error, so the caller can show it where it happened.
   */
  apply: (send: () => Promise<Cart>) => Promise<void>;
}

/** The cart behind an adapter, with optimistic changes that roll back when the adapter rejects. */
export function useCart(adapter: CartAdapter, { onError }: UseCartOptions): UseCartResult {
  const [cart, setCart] = useState<Cart | null>(null);
  // What the backend last confirmed, to roll back to. Only the latest change may settle the state.
  const confirmed = useRef<Cart | null>(null);
  const latest = useRef(0);
  const report = useRef(onError);
  useEffect(() => {
    report.current = onError;
  }, [onError]);

  useEffect(() => {
    let current = true;
    adapter.getCart().then(
      (next) => {
        if (!current) return;
        confirmed.current = next;
        setCart(next);
      },
      (error: unknown) => {
        if (current) report.current(error);
      },
    );
    return () => {
      current = false;
    };
  }, [adapter]);

  const change = useCallback(async (optimistic: CartChange, send: () => Promise<Cart>) => {
    const request = ++latest.current;
    setCart((previous) => (previous ? optimisticCart(previous, optimistic) : previous));
    try {
      const next = await send();
      confirmed.current = next;
      if (request === latest.current) setCart(next);
    } catch (error) {
      if (request === latest.current) setCart(confirmed.current);
      report.current(error);
    }
  }, []);

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) =>
      change({ type: "quantity", lineId, quantity }, () =>
        adapter.setLineQuantity(lineId, quantity),
      ),
    [adapter, change],
  );
  const removeLine = useCallback(
    (lineId: string) => change({ type: "remove", lineId }, () => adapter.removeLine(lineId)),
    [adapter, change],
  );

  const apply = useCallback(async (send: () => Promise<Cart>) => {
    const request = ++latest.current;
    const next = await send();
    confirmed.current = next;
    if (request === latest.current) setCart(next);
  }, []);

  return { cart, setLineQuantity, removeLine, apply };
}
