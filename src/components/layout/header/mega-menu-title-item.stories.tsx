import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MegaMenuTitleItem } from "./mega-menu-title-item";

const meta = {
  title: "Components/Navigation/Mega Menu/Title Item",
  component: MegaMenuTitleItem,
  args: { label: "Title", chevron: true, selected: false },
  parameters: {
    controls: { include: ["label", "chevron", "selected"] },
    docs: {
      description: {
        component: "A Mega Menu group title, or a category in the Subcategory Showcase sidebar.",
      },
    },
  },
  argTypes: {
    label: { description: "Figma `Label Text`.", control: "text" },
    chevron: { description: "Figma `Show Right Icon`.", control: "boolean" },
    selected: { description: "Figma `State=Hover & Selected`.", control: "boolean" },
  },
} satisfies Meta<typeof MegaMenuTitleItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Figma `State=Hover & Selected`. */
export const Selected: Story = { args: { selected: true } };
