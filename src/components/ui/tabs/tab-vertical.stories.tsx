import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Tab, TabList, TabPanel, Tabs } from "./tabs";

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
  title: "Components/Navigation/Tabs/Vertical Tab",
  // The defaults of Figma's `Vertical Tab` and its `.Base Vertical Tab`.
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
      orientation="vertical"
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

/** Figma Vertical Tab: account side navigation inside a page. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="orders" orientation="vertical">
      <TabList label="Account">
        <Tab value="orders" leftIcon="radio_button_unchecked">
          Orders
        </Tab>
        <Tab value="address" leftIcon="radio_button_unchecked">
          Addresses
        </Tab>
        <Tab value="payment" leftIcon="radio_button_unchecked" disabled>
          Payment
        </Tab>
      </TabList>
      <TabPanel value="orders" className="text-body-md">
        Orders
      </TabPanel>
      <TabPanel value="address" className="text-body-md">
        Addresses
      </TabPanel>
      <TabPanel value="payment">Payment</TabPanel>
    </Tabs>
  ),
};
