import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Price } from "./price";

const meta = {
  title: "Components/Data Display/Price",
  component: Price,
  args: { price: { amount: 2800, currency: "EUR" } },
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A whole amount drops the decimals: €28. */
export const Default: Story = {};

/** On sale: the current price, then the original one struck through. */
export const OnSale: Story = {
  args: { price: { amount: 2250, currency: "EUR" }, compareAt: { amount: 2800, currency: "EUR" } },
};

/** The three sizes, from the card to the product page. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-12">
      <Price {...args} size="md" />
      <Price {...args} size="lg" />
      <Price {...args} size="xl" />
    </div>
  ),
};

/** The sale price above the original one. */
export const Column: Story = {
  args: { ...OnSale.args, layout: "column" },
};

/** An unavailable variant: the price is muted. */
export const Disabled: Story = { args: { disabled: true } };
