import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMockCartAdapter } from "./mock-cart-adapter";
import type { CartAdapter } from "./cart-adapter";
import { useCart } from "./use-cart";
import type { Cart } from "@/lib/api/types/cart";

const eur = (amount: number) => ({ amount, currency: "EUR" });

const SEED: Cart = {
  id: "cart-1",
  lines: [
    {
      id: "l1",
      productId: "p1",
      variantId: "v1",
      name: "Glow Serum",
      slug: "glow-serum",
      quantity: 1,
      maxQuantity: 5,
      unitPrice: eur(7000),
      lineTotal: eur(7000),
    },
    {
      id: "l2",
      productId: "p2",
      variantId: "v2",
      name: "Cloud Cream",
      slug: "cloud-cream",
      quantity: 1,
      maxQuantity: 5,
      unitPrice: eur(3800),
      lineTotal: eur(3800),
    },
  ],
  subtotal: eur(10800),
  coupons: [],
  discounts: eur(0),
  shipping: null,
  total: eur(10800),
  freeShippingThreshold: eur(15000),
};

async function loaded(adapter: CartAdapter, onError = vi.fn()) {
  const hook = renderHook(() => useCart(adapter, { onError }));
  await waitFor(() => expect(hook.result.current.cart).not.toBeNull());
  return hook;
}

describe("useCart", () => {
  it("reads the cart from the adapter", async () => {
    const { result } = await loaded(createMockCartAdapter(SEED));
    expect(result.current.cart?.subtotal.amount).toBe(10800);
  });

  it("changes a quantity and reprices through the adapter", async () => {
    const { result } = await loaded(createMockCartAdapter(SEED));
    await act(() => result.current.setLineQuantity("l1", 2));
    expect(result.current.cart?.lines[0].quantity).toBe(2);
    expect(result.current.cart?.subtotal.amount).toBe(17800);
  });

  it("removes a line", async () => {
    const { result } = await loaded(createMockCartAdapter(SEED));
    await act(() => result.current.removeLine("l1"));
    expect(result.current.cart?.lines.map((line) => line.id)).toEqual(["l2"]);
  });

  it("shows the change before the adapter answers", async () => {
    let answer: (cart: Cart) => void = () => {};
    const adapter: CartAdapter = {
      ...createMockCartAdapter(SEED),
      setLineQuantity: () => new Promise((resolve) => (answer = resolve)),
    };
    const { result } = await loaded(adapter);
    act(() => void result.current.setLineQuantity("l1", 3));
    expect(result.current.cart?.lines[0].quantity).toBe(3);
    await act(async () => answer(SEED));
    expect(result.current.cart?.lines[0].quantity).toBe(1);
  });

  it("rolls back and reports when the adapter fails", async () => {
    const failure = new Error("Network down");
    const onError = vi.fn();
    const adapter: CartAdapter = {
      ...createMockCartAdapter(SEED),
      removeLine: () => Promise.reject(failure),
    };
    const { result } = await loaded(adapter, onError);
    await act(() => result.current.removeLine("l1"));
    expect(result.current.cart?.lines).toHaveLength(2);
    expect(onError).toHaveBeenCalledWith(failure);
  });

  it("reports a failed first read", async () => {
    const failure = new Error("No cart");
    const onError = vi.fn();
    renderHook(() =>
      useCart(
        { ...createMockCartAdapter(SEED), getCart: () => Promise.reject(failure) },
        { onError },
      ),
    );
    await waitFor(() => expect(onError).toHaveBeenCalledWith(failure));
  });

  it("does not mutate the seed cart", async () => {
    const { result } = await loaded(createMockCartAdapter(SEED));
    await act(() => result.current.removeLine("l1"));
    expect(SEED.lines).toHaveLength(2);
  });
});
