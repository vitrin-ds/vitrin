import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Tab, TabList, TabPanel, Tabs } from "./tabs";

const CATEGORIES = ["All", "Skincare", "Make-up", "Hair", "Fragrance", "Wellness", "Guides"];

/** Figma's properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "default" | "disabled";
  selection: "unselected" | "selected";
  labelText: string;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showBadge: boolean;
};

const meta = {
  title: "Components/Navigation/Tabs/Horizontal Tab",
  // The defaults of Figma's `Horizontal Tab` and its `.Base Horizontal Tab`.
  args: {
    state: "default",
    selection: "unselected",
    labelText: "Tab",
    showLeftIcon: true,
    leftIcon: "radio_button_unchecked",
    showBadge: true,
  },
  // One tab, as the Figma component. In code a tab always sits in Tabs and TabList.
  render: ({ state, selection, labelText, showLeftIcon, leftIcon, showBadge }) => (
    <Tabs
      key={selection}
      defaultValue={selection === "selected" ? "tab" : "other"}
      orientation="horizontal"
    >
      <TabList label="Example">
        <Tab
          value="tab"
          disabled={state === "disabled"}
          leftIcon={showLeftIcon ? leftIcon : undefined}
          badge={showBadge ? 2 : undefined}
        >
          {labelText}
        </Tab>
      </TabList>
      <TabPanel value="tab" />
    </Tabs>
  ),
  parameters: {
    controls: {
      include: ["state", "selection", "labelText", "showLeftIcon", "leftIcon", "showBadge"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for organizing related content within a single view",
        "Keep tab labels short and descriptive (1-2 words)",
        "Use badge to indicate new items or counts (e.g., notifications, cart items)",
        "Highlight the selected tab clearly with visual distinction",
      ],
      dont: [
        "Don't use more than 5-6 tabs — consider alternative navigation for more",
        "Don't use for primary navigation — use Header or Bottom Navigation",
        "Don't mix tabs with and without icons inconsistently",
        "Don't disable tabs without clear reason",
      ],
    },
    docs: {
      description: {
        component:
          "A navigation component that organizes content into selectable sections, allowing users to switch between views within the same context.",
      },
    },
  },
  argTypes: {
    state: {
      description: "Figma `State`. Hover and Focus are CSS states; Disabled in code: `disabled`.",
      control: "inline-radio",
      options: ["default", "disabled"],
      table: { type: { summary: "string" }, defaultValue: { summary: "default" } },
    },
    selection: {
      description: "Figma `Selection`. In code: `value` on Tabs.",
      control: "inline-radio",
      options: ["unselected", "selected"],
      table: { type: { summary: "string" }, defaultValue: { summary: "unselected" } },
    },
    labelText: {
      description: "Figma `Label Text`. In code: `children`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Tab" } },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `leftIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
    showBadge: {
      description: "Figma `Show Badge`. In code: pass `badge`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** `layout="scroll"`: hug tabs, scrolls sideways on narrow screens. Use when tabs may overflow on mobile. */
export const Scroll: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="All" className="max-w-712">
      <TabList label="Categories">
        {CATEGORIES.map((c) => (
          <Tab key={c} value={c}>
            {c}
          </Tab>
        ))}
      </TabList>
      {CATEGORIES.map((c) => (
        <TabPanel key={c} value={c} className="py-16 text-body-md text-text-secondary">
          {c} products
        </TabPanel>
      ))}
    </Tabs>
  ),
};

/** `layout="fill"`: equal widths for 2–3 views of the same content. */
export const Fill: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-712">
      <Tabs defaultValue="list">
        <TabList label="View" layout="fill">
          <Tab value="list">List</Tab>
          <Tab value="map">Map</Tab>
        </TabList>
        <TabPanel value="list" className="py-16 text-body-md">
          Store list
        </TabPanel>
        <TabPanel value="map" className="py-16 text-body-md">
          Store map
        </TabPanel>
      </Tabs>
    </div>
  ),
};

/** Layout Center: four equal tabs in a centred 976px group over a full-width rule (PDP 06.01). */
export const Center: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="description">
      <TabList label="Product information" layout="center">
        <Tab value="description">Description</Tab>
        <Tab value="specifications">Specifications</Tab>
        <Tab value="how-to-use">How to use</Tab>
        <Tab value="ingredients">Ingredients</Tab>
      </TabList>
      {["description", "specifications", "how-to-use", "ingredients"].map((value) => (
        <TabPanel key={value} value={value} className="py-16 text-body-md">
          {value}
        </TabPanel>
      ))}
    </Tabs>
  ),
};

/** Selection × Default · Disabled, with icon and badge, as a row. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="orders">
      <TabList label="Account">
        <Tab value="orders" leftIcon="radio_button_unchecked" badge={2}>
          Orders
        </Tab>
        <Tab value="returns" leftIcon="radio_button_unchecked" badge={2}>
          Returns
        </Tab>
        <Tab value="gift" leftIcon="radio_button_unchecked" badge={2} disabled>
          Gift cards
        </Tab>
      </TabList>
      <TabPanel value="orders" className="py-16 text-body-md">
        Orders
      </TabPanel>
      <TabPanel value="returns" className="py-16 text-body-md">
        Returns
      </TabPanel>
      <TabPanel value="gift">Gift cards</TabPanel>
    </Tabs>
  ),
};

/** Arrow keys move focus and select; Tab leaves the list. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  render: Scroll.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "All" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    const tab = canvas.getByRole("tab", { name: "Skincare" });
    await expect(tab).toHaveFocus();
    await expect(tab).toHaveAttribute("aria-selected", "true");
  },
};

/**
 * `revealFrom="desktop"`: List / Map are tabs below 1024px and sit side by side from desktop
 * (Store Finder). The List panel stays mounted; the TabList is hidden from desktop.
 */
export const RevealFromDesktop: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="map">
      <TabList label="Results view" layout="fill" className="desktop:hidden">
        <Tab value="list">List</Tab>
        <Tab value="map">Map</Tab>
      </TabList>
      <div className="flex gap-16">
        <TabPanel value="list" revealFrom="desktop" className="flex-1 py-16 text-body-md">
          Store list
        </TabPanel>
        <TabPanel value="map" className="flex-1 py-16 text-body-md">
          Map
        </TabPanel>
      </div>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The unselected List panel stays rendered, hidden by CSS below desktop only.
    const list = canvas.getByText("Store list");
    await expect(list).not.toHaveAttribute("hidden");
    await expect(list).toHaveClass("max-desktop:hidden");
  },
};

/** Thin, unfilled icons with a count, as Rewards (Figma 03.04). */
export const OutlineIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="gift">
      <TabList label="Rewards" layout="fill">
        <Tab value="gift" leftIcon="redeem" leftIconOutline badge={4}>
          Gift Cards
        </Tab>
        <Tab value="coupons" leftIcon="loyalty" leftIconOutline badge={3}>
          Coupons
        </Tab>
      </TabList>
      <TabPanel value="gift">Your gift cards</TabPanel>
      <TabPanel value="coupons">Your coupons</TabPanel>
    </Tabs>
  ),
};
