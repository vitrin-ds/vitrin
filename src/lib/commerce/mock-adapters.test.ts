import { describe, expect, it } from "vitest";
import { createMockAddressBookAdapter } from "./mock-address-book-adapter";
import { createMockCartAdapter } from "./mock-cart-adapter";
import { createMockCheckoutAdapter, MOCK_TEST_CARDS } from "./mock-checkout-adapter";
import { createMockOrderAdapter } from "./mock-order-adapter";
import { SAMPLE_ADDRESS, SAMPLE_ORDERS } from "./mock-samples";

const { id: _id, isDefaultShipping: _s, isDefaultBilling: _b, ...ADDRESS_INPUT } = SAMPLE_ADDRESS;

const placeInput = (number: string) => ({
  email: "jane@example.com",
  shippingAddress: {
    firstName: "Jane",
    lastName: "Doe",
    line1: "12 Sample Street",
    postalCode: "N1 9GU",
    city: "London",
    countryCode: "GB",
    phone: "+44 20 7946 0000",
  },
  shippingMethodId: "standard",
  payment: {
    type: "card" as const,
    number,
    holderName: "Jane Doe",
    expiryMonth: 1,
    expiryYear: 2030,
    cvc: "123",
  },
});

describe("createMockOrderAdapter", () => {
  it("lists the sample orders newest first and finds one", async () => {
    const adapter = createMockOrderAdapter();
    const orders = await adapter.listOrders();
    expect(orders.map((order) => order.number)).toEqual(["1002", "1001"]);
    expect(await adapter.getOrder(SAMPLE_ORDERS[1].id)).toEqual(SAMPLE_ORDERS[1]);
    expect(await adapter.getOrder("nope")).toBeNull();
  });
});

describe("createMockAddressBookAdapter", () => {
  it("adds, makes default and deletes, answering with the whole book", async () => {
    const adapter = createMockAddressBookAdapter();
    const added = await adapter.addAddress({
      ...ADDRESS_INPUT,
      label: "Office",
      isDefaultShipping: true,
    });
    expect(added).toHaveLength(2);
    expect(added.filter((item) => item.isDefaultShipping).map((item) => item.label)).toEqual([
      "Office",
    ]);
    const office = added[1];
    const billing = await adapter.setDefaultAddress(office.id, "billing");
    expect(billing.find((item) => item.isDefaultBilling)?.id).toBe(office.id);
    expect(await adapter.deleteAddress(office.id)).toHaveLength(1);
    await expect(adapter.deleteAddress(office.id)).rejects.toMatchObject({
      code: "unknown-address",
    });
  });
});

describe("createMockCheckoutAdapter", () => {
  it("places an order for the cart it is given", async () => {
    const cart = createMockCartAdapter();
    await cart.addLine("v-1", 2, {
      preview: {
        productId: "p-1",
        name: "Night Cream",
        slug: "night-cream",
        unitPrice: { amount: 2800, currency: "EUR" },
      },
    });
    const adapter = createMockCheckoutAdapter({ getCart: cart.getCart });
    expect(await adapter.getCustomer()).toBeNull();
    expect(await adapter.getShippingMethods()).toHaveLength(2);
    const outcome = await adapter.placeOrder(placeInput("4242 4242 4242 4242"));
    expect(outcome.status).toBe("placed");
    if (outcome.status !== "placed") return;
    expect(outcome.order.lines[0]).toMatchObject({ name: "Night Cream", quantity: 2 });
    expect(outcome.order.total).toEqual({ amount: 5600 + 495, currency: "EUR" });
  });

  it("declines the test card and asks for 3D Secure on the other", async () => {
    const adapter = createMockCheckoutAdapter();
    await expect(adapter.placeOrder(placeInput(MOCK_TEST_CARDS.declined))).rejects.toMatchObject({
      code: "payment-declined",
    });
    const outcome = await adapter.placeOrder(placeInput(MOCK_TEST_CARDS.threeDSecure));
    expect(outcome.status).toBe("requires-action");
    if (outcome.status !== "requires-action") return;
    expect((await adapter.confirmThreeDSecure(outcome.paymentId, true)).status).toBe("confirmed");
  });
});
