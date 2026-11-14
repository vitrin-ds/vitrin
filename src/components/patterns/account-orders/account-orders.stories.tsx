import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { createMockOrderAdapter } from "@/lib/commerce/mock-order-adapter";
import { SAMPLE_ORDERS } from "@/lib/commerce/mock-samples";
import { AccountOrders } from "./account-orders";
import { ConnectedAccountOrders } from "./connected-account-orders";

// The order history as it installs: the block on its own, and the connected version on
// createMockOrderAdapter. The previews on vitrin.design/blocks/account-orders.

const meta = {
  title: "Blocks/Account Orders",
  component: AccountOrders,
  parameters: { layout: "fullscreen" },
  args: {
    orders: SAMPLE_ORDERS,
    orderHref: (order) => `/account/orders/${order.id}`,
  },
} satisfies Meta<typeof AccountOrders>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The sample orders, newest first. */
export const Default: Story = {};

/** No orders yet. */
export const Empty: Story = { args: { orders: [] } };

/** The connected version: the orders come from the order adapter. */
export const Connected: Story = {
  render: () => (
    <ConnectedAccountOrders
      adapter={createMockOrderAdapter()}
      orderHref={(order) => `/account/orders/${order.id}`}
      onError={fn()}
    />
  ),
};
