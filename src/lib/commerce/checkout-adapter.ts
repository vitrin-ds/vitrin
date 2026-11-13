import type {
  Customer,
  PlaceOrderInput,
  PlaceOrderOutcome,
  ShippingMethod,
} from "@/lib/api/types/checkout";
import type { Order } from "@/lib/api/types/orders";

/**
 * What the checkout block needs from a backend: the shopper, the delivery options for the
 * current cart, placing the order and the bank's 3D Secure answer. Methods reject with a
 * `CommerceError` when the call did not go through ("payment-declined", "invalid-payment" …).
 */
export interface CheckoutAdapter {
  /** The signed-in customer (saved addresses and cards), or null for a guest. */
  getCustomer(): Promise<Customer | null>;
  signOut(): Promise<void>;
  /** Delivery options priced for the current cart. */
  getShippingMethods(): Promise<ShippingMethod[]>;
  /** Places the order, or asks for a 3D Secure step first ("requires-action"). */
  placeOrder(input: PlaceOrderInput): Promise<PlaceOrderOutcome>;
  /** The bank's answer to the 3D Secure step: the placed order. */
  confirmThreeDSecure(paymentId: string, approve: boolean): Promise<Order>;
}
