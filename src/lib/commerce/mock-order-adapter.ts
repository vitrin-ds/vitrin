import type { Order } from "@/lib/api/types/orders";
import type { OrderAdapter } from "./commerce-adapter";
import { SAMPLE_ORDERS } from "./mock-samples";

/** In-memory orders for a first install: the sample orders, or the ones it is given. */
export function createMockOrderAdapter(orders: readonly Order[] = SAMPLE_ORDERS): OrderAdapter {
  const newestFirst = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  return {
    listOrders: async () => newestFirst,
    getOrder: async (orderId) => newestFirst.find((order) => order.id === orderId) ?? null,
  };
}
