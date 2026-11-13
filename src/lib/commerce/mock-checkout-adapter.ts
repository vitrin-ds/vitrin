import type { Cart } from "@/lib/api/types/cart";
import type {
  AddressInput,
  Customer,
  PlaceOrderInput,
  ShippingMethod,
} from "@/lib/api/types/checkout";
import type { Address } from "@/lib/api/types/customer";
import type { Order } from "@/lib/api/types/orders";
import type { CheckoutAdapter } from "./checkout-adapter";
import { CommerceError } from "./commerce-error";
import { emptyCart } from "./mock-cart-adapter";
import { SAMPLE_SHIPPING_METHODS } from "./mock-samples";

/** Card numbers the mock answers differently, like a payment provider's test cards. */
export const MOCK_TEST_CARDS = {
  declined: "4000000000000002",
  threeDSecure: "4000000000003220",
} as const;

export interface MockCheckoutOptions {
  /** The signed-in customer; null (the default) checks out as a guest. */
  customer?: Customer | null;
  methods?: readonly ShippingMethod[];
  /** The cart the order is placed for, e.g. a mock cart adapter's `getCart`. */
  getCart?: () => Promise<Cart>;
}

const asAddress = (input: AddressInput, id: string): Address => ({
  ...input,
  id,
  label: "Checkout",
  isDefaultShipping: false,
  isDefaultBilling: false,
});

/**
 * An in-memory checkout for a first install: guest by default, two delivery options, and orders
 * placed from the cart it is given. MOCK_TEST_CARDS decline a card or ask for 3D Secure.
 */
export function createMockCheckoutAdapter({
  customer = null,
  methods = SAMPLE_SHIPPING_METHODS,
  getCart = async () => emptyCart(),
}: MockCheckoutOptions = {}): CheckoutAdapter {
  let signedIn = customer;
  let placed = 0;
  const pending = new Map<string, Order>();

  async function orderFor(input: PlaceOrderInput): Promise<Order> {
    const method = methods.find((item) => item.id === input.shippingMethodId);
    if (!method) throw new CommerceError("invalid-shipping-method");
    const cart = await getCart();
    placed += 1;
    const id = `mock-order-${placed}`;
    const placedAt = new Date().toISOString();
    return {
      id,
      number: String(2000 + placed),
      placedAt,
      status: "confirmed",
      email: input.email,
      lines: cart.lines.map((line) => ({
        id: `${id}-${line.id}`,
        productId: line.productId,
        variantId: line.variantId,
        slug: line.slug,
        name: line.name,
        variantTitle: line.variantTitle,
        image: line.image,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
      shippingAddress: asAddress(input.shippingAddress, `${id}-shipping`),
      subtotal: cart.subtotal,
      discounts: cart.discounts,
      shipping: method.price,
      total: {
        amount: cart.subtotal.amount - cart.discounts.amount + method.price.amount,
        currency: cart.subtotal.currency,
      },
      shippingMethod: { id: method.id, name: method.name },
      timeline: [{ id: "placed", title: "Order placed", occurredAt: placedAt }],
    };
  }

  return {
    getCustomer: async () => signedIn,
    signOut: async () => {
      signedIn = null;
    },
    getShippingMethods: async () => [...methods],
    placeOrder: async (input) => {
      const card = input.payment.type === "card" ? input.payment.number.replace(/\s/g, "") : "";
      if (card === MOCK_TEST_CARDS.declined) throw new CommerceError("payment-declined");
      const order = await orderFor(input);
      if (card === MOCK_TEST_CARDS.threeDSecure) {
        const paymentId = `mock-payment-${order.id}`;
        pending.set(paymentId, order);
        return { status: "requires-action", paymentId, amount: order.total };
      }
      return { status: "placed", order };
    },
    confirmThreeDSecure: async (paymentId, approve) => {
      const order = pending.get(paymentId);
      pending.delete(paymentId);
      if (!order || !approve) throw new CommerceError("payment-declined");
      return order;
    },
  };
}
