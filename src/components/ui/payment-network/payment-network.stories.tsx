import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PaymentNetwork } from "./payment-network";

const NETWORKS = [
  "visa",
  "mastercard",
  "amex",
  "jcb",
  "paypal",
  "apple-pay",
  "google-pay",
  "klarna",
] as const;

const meta = {
  title: "Components/Data Display/Payment Network",
  component: PaymentNetwork,
  args: { network: "visa" },
  argTypes: { network: { control: "select", options: NETWORKS } },
} satisfies Meta<typeof PaymentNetwork>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One network's mark. */
export const Default: Story = {};

/** Every network, as in a footer's "We accept" row. */
export const AllNetworks: Story = {
  render: () => (
    <ul className="flex flex-wrap items-center gap-8">
      {NETWORKS.map((network) => (
        <li key={network}>
          <PaymentNetwork network={network} />
        </li>
      ))}
    </ul>
  ),
};
