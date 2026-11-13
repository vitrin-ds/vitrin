import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MegaMenuLinkItem } from "./mega-menu-link-item";

const meta = {
  title: "Components/Navigation/Mega Menu/Link Item",
  component: MegaMenuLinkItem,
  args: { href: "/c/sample", label: "Link Item", size: "default", chevron: true },
  parameters: {
    controls: { include: ["size", "label", "chevron"] },
    docs: {
      description: {
        component: "A single link in a Mega Menu group, with an optional arrow.",
      },
    },
  },
  argTypes: {
    size: {
      description: "Figma `Size`: Default or Small.",
      control: "radio",
      options: ["default", "sm"],
    },
    label: { description: "Figma `Label Text`.", control: "text" },
    chevron: { description: "Figma `Show Right Icon`.", control: "boolean" },
  },
} satisfies Meta<typeof MegaMenuLinkItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Figma `Size=Small`: the action links after a group's links. */
export const Small: Story = { args: { size: "sm", label: "Show All Products" } };
