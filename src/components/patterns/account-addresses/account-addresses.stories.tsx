import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { createMockAddressBookAdapter } from "@/lib/commerce/mock-address-book-adapter";
import { SAMPLE_ADDRESS } from "@/lib/commerce/mock-samples";
import { AccountAddresses } from "./account-addresses";

// The address book as it installs: on createMockAddressBookAdapter, with the sample address. The
// preview on vitrin.design/blocks/account-addresses.

const meta = {
  title: "Blocks/Account Addresses",
  component: AccountAddresses,
  parameters: { layout: "fullscreen" },
  args: {
    addresses: [SAMPLE_ADDRESS],
    adapter: createMockAddressBookAdapter(),
    onNotice: fn(),
  },
} satisfies Meta<typeof AccountAddresses>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One saved address, the default for delivery and billing. */
export const Default: Story = {};

/** No saved addresses yet. */
export const Empty: Story = { args: { addresses: [], adapter: createMockAddressBookAdapter([]) } };
