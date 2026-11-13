import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Cart } from "@/lib/api/types/cart";
import type { Customer, ShippingMethod } from "@/lib/api/types/checkout";
import type { CheckoutAdapter } from "@/lib/commerce/checkout-adapter";
import { CommerceError } from "@/lib/commerce/commerce-error";
import { Checkout, type CheckoutProps } from "./checkout";

const eur = (amount: number) => ({ amount, currency: "EUR" });

const CART: Cart = {
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
  ],
  subtotal: eur(7000),
  coupons: [],
  discounts: eur(0),
  shipping: null,
  total: eur(7000),
  freeShippingThreshold: eur(15000),
};

const CUSTOMER: Customer = {
  id: "u1",
  firstName: "Ada",
  lastName: "Smith",
  email: "ada@example.com",
  loyaltyPoints: 0,
  addresses: [
    {
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
    },
  ],
  paymentMethods: [
    {
      id: "pm1",
      type: "card",
      network: "visa",
      last4: "4242",
      holderName: "Ada Smith",
      expiryMonth: 12,
      expiryYear: 2031,
      isDefault: true,
    },
  ],
};

const METHODS: ShippingMethod[] = [
  { id: "standard", name: "Standard", price: eur(495), description: "3–5 working days" },
] as ShippingMethod[];

function adapter(overrides: Partial<CheckoutAdapter> = {}): CheckoutAdapter {
  return {
    getCustomer: vi.fn(async () => CUSTOMER),
    signOut: vi.fn(async () => {}),
    getShippingMethods: vi.fn(async () => METHODS),
    placeOrder: vi.fn(async () => ({ status: "placed" as const, order: { id: "o1" } as never })),
    confirmThreeDSecure: vi.fn(async () => ({ id: "o2" }) as never),
    ...overrides,
  };
}

function renderCheckout(props: Partial<CheckoutProps> = {}) {
  const handlers = { onPlaced: vi.fn(), onNotice: vi.fn() };
  render(
    <Checkout
      initial={{ cart: CART, customer: CUSTOMER, methods: METHODS }}
      cart={CART}
      adapter={adapter()}
      onApplyCoupon={() => ({ ok: true })}
      onRemoveCoupon={() => {}}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

const pay = () => screen.getAllByRole("button", { name: /^Pay / })[0]!;

describe("Checkout", () => {
  it("places a signed-in customer's order with the saved address and card", async () => {
    const checkout = adapter();
    const { onPlaced } = renderCheckout({ adapter: checkout });
    expect(screen.getByText(/Signed in as Ada Smith/)).toBeInTheDocument();
    await userEvent.click(pay());
    await waitFor(() => expect(onPlaced).toHaveBeenCalledWith("o1"));
    expect(checkout.placeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        shippingMethodId: "standard",
        payment: { type: "saved", paymentMethodId: "pm1" },
      }),
    );
  });

  it("shows a declined card in Payment instead of moving on", async () => {
    const { onPlaced } = renderCheckout({
      adapter: adapter({
        placeOrder: vi.fn(async () => {
          throw new CommerceError("payment-declined");
        }),
      }),
    });
    await userEvent.click(pay());
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onPlaced).not.toHaveBeenCalled();
  });

  it("asks for 3D Secure and places the order when the bank approves", async () => {
    const { onPlaced } = renderCheckout({
      adapter: adapter({
        placeOrder: vi.fn(async () => ({
          status: "requires-action" as const,
          paymentId: "pay1",
          amount: eur(7495),
        })),
      }),
    });
    await userEvent.click(pay());
    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getAllByRole("button")[0]!);
    await waitFor(() => expect(onPlaced).toHaveBeenCalled());
  });

  it("sends other failures to onNotice", async () => {
    const { onNotice } = renderCheckout({
      adapter: adapter({
        placeOrder: vi.fn(async () => {
          throw new Error("network");
        }),
      }),
    });
    await userEvent.click(pay());
    await waitFor(() =>
      expect(onNotice).toHaveBeenCalledWith(expect.objectContaining({ tone: "error" })),
    );
  });
});
