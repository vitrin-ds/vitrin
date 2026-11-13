import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ICON_NAMES, type IconName } from "@/components/ui/icon/icon-names";
import { NAVIGATION } from "./header.fixtures";
import { NavigationBar } from "./navigation-bar";

/** Figma's `Show` booleans. Storybook only: in code an item shows when it is in `items`. */
type Args = {
  item1Text: string;
  item2Text: string;
  item3Text: string;
  item4Text: string;
  item5Text: string;
  item6Text: string;
  featuredItem: number;
  showRightIcon: boolean;
  rightIcon: IconName;
  showItem2: boolean;
  showItem3: boolean;
  showItem4: boolean;
  showItem5: boolean;
  showItem6: boolean;
  /** Not a Base property: `State` of the nested `.Asset Navigation Bar Item`. */
  currentId: string | undefined;
};

const meta = {
  title: "Components/Navigation/Header & Navigation Bar/Navigation Bar",
  // The defaults of Figma's `.Base Navigation Bar`.
  args: {
    item1Text: "Shop by Categories",
    item2Text: "Best Sellers",
    item3Text: "Skin Care",
    item4Text: "Make Up",
    item5Text: "Hair Care",
    item6Text: "On Sale",
    featuredItem: 6,
    showRightIcon: true,
    rightIcon: "keyboard_arrow_down",
    showItem2: true,
    showItem3: true,
    showItem4: true,
    showItem5: true,
    showItem6: true,
    currentId: undefined,
  },
  render: ({ currentId, featuredItem, showRightIcon, rightIcon, ...args }) => (
    <NavigationBar
      currentId={currentId}
      items={NAVIGATION.map((item, index) => ({
        ...item,
        label: args[`item${index + 1}Text` as "item1Text"],
        featured: featuredItem === index + 1,
        rightIcon: !showRightIcon ? null : item.menu ? rightIcon : undefined,
      })).filter((_, index) => index === 0 || args[`showItem${index + 1}` as "showItem2"])}
    />
  ),
  parameters: {
    figma: {
      do: [
        "Keep navigation items to 5-7 max for scannability",
        'Use Featured style sparingly — only for promotions like "On Sale"',
        "Show Active state for current category",
        "Consider hiding on mobile in favor of hamburger menu",
      ],
      dont: [
        "Don't overload with too many categories — use mega menu for deeper navigation",
        "Don't use Featured style on multiple items simultaneously",
        "Don't hide primary categories without alternative access",
        "Don't mix icon and non-icon items inconsistently",
      ],
    },
    layout: "fullscreen",
    // The Figma properties of the Base and of .Asset Navigation Bar Item. Breakpoint is responsive (CSS).
    controls: {
      include: [
        "item1Text",
        "showItem2",
        "item2Text",
        "showItem3",
        "item3Text",
        "showItem4",
        "item4Text",
        "showItem5",
        "item5Text",
        "showItem6",
        "item6Text",
        "featuredItem",
        "showRightIcon",
        "rightIcon",
      ],
    },
    docs: {
      description: {
        component:
          "The primary category strip under the Main Header; an item is a link or opens its Mega Menu.",
      },
    },
  },
  argTypes: {
    item1Text: {
      description: "Figma `Label Text` of item 1.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Shop by Categories" } },
    },
    item2Text: {
      description: "Figma `Label Text` of item 2.",
      control: "text",
      if: { arg: "showItem2" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Best Sellers" } },
    },
    item3Text: {
      description: "Figma `Label Text` of item 3.",
      control: "text",
      if: { arg: "showItem3" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Skin Care" } },
    },
    item4Text: {
      description: "Figma `Label Text` of item 4.",
      control: "text",
      if: { arg: "showItem4" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Make Up" } },
    },
    item5Text: {
      description: "Figma `Label Text` of item 5.",
      control: "text",
      if: { arg: "showItem5" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Hair Care" } },
    },
    item6Text: {
      description: "Figma `Label Text` of item 6.",
      control: "text",
      if: { arg: "showItem6" },
      table: { type: { summary: "string" }, defaultValue: { summary: "On Sale" } },
    },
    featuredItem: {
      description:
        "Figma `is Featured?=Yes`: the item with the accent pill (Figma Don't: only one). 0 is none.",
      control: "select",
      options: [0, 1, 2, 3, 4, 5, 6],
      table: { type: { summary: "number" }, defaultValue: { summary: "6" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: `rightIcon: null` on the item.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`, on items with a menu. In code: `rightIcon` on the item.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "keyboard_arrow_down" } },
    },
    showItem2: {
      description:
        "Figma `Show .Asset Navigation Bar Item [2]`. In code: leave the item out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem3: {
      description:
        "Figma `Show .Asset Navigation Bar Item [3]`. In code: leave the item out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem4: {
      description:
        "Figma `Show .Asset Navigation Bar Item [4]`. In code: leave the item out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem5: {
      description:
        "Figma `Show .Asset Navigation Bar Item [5]`. In code: leave the item out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem6: {
      description:
        "Figma `Show .Asset Navigation Bar Item [6]`. In code: leave the item out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The category strip (Figma 30559:37891): all items from 744px, the first one only below. */
export const Default: Story = {};

/** The item of the current section is Active (aria-current="page" on a link). */
export const CurrentSection: Story = { args: { currentId: "hair-care" } };

/** A disclosure button opens its Mega Menu; Escape closes it and focus returns to the button. */
export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Shop by Categories" });
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const panel = canvasElement.querySelector(
      `#${CSS.escape(button.getAttribute("aria-controls") ?? "")}`,
    );
    await expect(panel).not.toHaveAttribute("hidden");
    await expect(canvas.getByRole("link", { name: "Lipstick" })).toBeInTheDocument();
  },
};

/** Escape closes the open Mega Menu and returns focus to its button. */
export const KeyboardClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Make Up" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toHaveFocus();
  },
};
