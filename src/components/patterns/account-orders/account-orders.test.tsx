import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Address } from "@/lib/api/types/customer";
import type { Order, OrderStatus } from "@/lib/api/types/orders";
import { expectNoAxeViolations } from "@/test/axe";
import { AccountOrders } from "./account-orders";
import { ConnectedAccountOrders } from "./connected-account-orders";

const eur = (amount: number) => ({ amount, currency: "EUR" });

const ADDRESS: Address = {
  id: "a1",
  label: "Home",
  firstName: "Ada",
  lastName: "Smith",
  line1: "2 Road",
  postalCode: "N2",
  city: "London",
  countryCode: "GB",
  phone: "+44 2",
  isDefaultShipping: true,
  isDefaultBilling: true,
};

function order(id: string, day: string, status: OrderStatus, product: string): Order {
  return {
    id,
    number: `TH-${id}`,
    placedAt: `${day}T10:00:00Z`,
    status,
    lines: [
      {
        id: `${id}-l`,
        productId: "p",
        variantId: "v",
        name: product,
        quantity: 1,
        unitPrice: eur(2000),
        lineTotal: eur(2000),
      },
    ],
    shippingAddress: ADDRESS,
    subtotal: eur(2000),
    discounts: eur(0),
    shipping: eur(0),
    total: eur(2000),
    timeline: [],
  } as Order;
}

const ORDERS = [
  order("1", "2026-11-10", "delivered", "Glow Serum"),
  order("2", "2026-11-10", "processing", "Calm Cleanser"),
  order("3", "2026-10-02", "cancelled", "Velvet Ampoule"),
];

const href = (o: Order) => `/account/orders/${o.id}`;

describe("AccountOrders", () => {
  it("groups the orders by day, newest first, with links", () => {
    render(<AccountOrders orders={ORDERS} orderHref={href} />);
    const days = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(days).toEqual(["Nov 10", "Oct 02"]);
    expect(
      screen.getAllByRole("link").some((a) => a.getAttribute("href") === "/account/orders/3"),
    ).toBe(true);
  });

  it("filters by status and searches by product", async () => {
    render(<AccountOrders orders={ORDERS} orderHref={href} />);
    const group = screen.getByRole("group", { name: "Filter orders by status" });
    await userEvent.click(within(group).getByRole("button", { name: "Cancelled" }));
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    await userEvent.click(within(group).getByRole("button", { name: "All" }));
    await userEvent.type(screen.getByRole("searchbox"), "cleanser");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  });

  it("shows Show More past the page size", async () => {
    render(<AccountOrders orders={ORDERS} orderHref={href} pageSize={2} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "Show More" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("shows the empty state without orders", () => {
    render(<AccountOrders orders={[]} orderHref={href} shopHref="/shop" />);
    expect(screen.getByRole("link", { name: "Start shopping" })).toHaveAttribute("href", "/shop");
  });

  it("has no axe violations", async () => {
    const { container } = render(<AccountOrders orders={ORDERS} orderHref={href} />);
    await expectNoAxeViolations(container);
  });
});

describe("ConnectedAccountOrders", () => {
  it("reads the orders through the adapter", async () => {
    const listOrders = vi.fn(async () => ORDERS);
    render(<ConnectedAccountOrders adapter={{ listOrders }} orderHref={href} onError={() => {}} />);
    expect(await screen.findByText("Nov 10")).toBeInTheDocument();
  });

  it("shows no orders and reports a failed read", async () => {
    const onError = vi.fn();
    const listOrders = vi.fn(async () => {
      throw new Error("down");
    });
    render(<ConnectedAccountOrders adapter={{ listOrders }} orderHref={href} onError={onError} />);
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });
});
