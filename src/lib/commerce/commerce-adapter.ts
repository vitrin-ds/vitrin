import type { Category, Product, ProductPage, ProductQuery } from "@/lib/api/types/catalog";
import type { Customer } from "@/lib/api/types/checkout";
import type { Order } from "@/lib/api/types/orders";
import type { AddressBookAdapter } from "./address-book-adapter";
import type { CommerceCartAdapter } from "./cart-adapter";
import type { CheckoutAdapter } from "./checkout-adapter";

export type { AddressBookAdapter, AddressRole } from "./address-book-adapter";
export type { CommerceCartAdapter } from "./cart-adapter";
export type { CheckoutAdapter } from "./checkout-adapter";
export { CommerceError } from "./commerce-error";

/**
 * The data contract behind every Vitrin block: a block reads and
 * changes commerce data only through this, so the same block runs on the mock, on Shopify, or
 * on any backend someone writes an adapter for. Each part can be given on its own: a cart block
 * needs only `cart`.
 *
 * Methods answer with the data as the backend has it after the call, and reject with a
 * `CommerceError` when the call did not go through.
 */
export interface CommerceAdapter {
  catalog: CatalogAdapter;
  cart: CommerceCartAdapter;
  checkout: CheckoutAdapter;
  customer: CustomerAdapter;
  orders: OrderAdapter;
  addresses: AddressBookAdapter;
}

export interface CatalogAdapter {
  /** A product by its URL slug (Shopify: handle); null when there is none. */
  getProduct(slug: string): Promise<Product | null>;
  /** One page of products for a listing, search or collection query. */
  listProducts(query?: ProductQuery): Promise<ProductPage>;
  getCategories(): Promise<Category[]>;
}

export interface CustomerAdapter {
  /** The signed-in customer, or null for a guest. */
  getCustomer(): Promise<Customer | null>;
  signIn(email: string, password: string): Promise<Customer>;
  signOut(): Promise<void>;
}

export interface OrderAdapter {
  /** The signed-in customer's orders, newest first. */
  listOrders(): Promise<Order[]>;
  getOrder(orderId: string): Promise<Order | null>;
}
