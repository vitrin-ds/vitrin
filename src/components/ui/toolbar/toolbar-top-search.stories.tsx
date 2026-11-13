import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ToolbarTopSearch } from "./toolbar-top-search";

/** Figma's properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: string;
  showLeftButton: boolean;
  leftIcon: IconName;
  showSearch: boolean;
  showActions: boolean;
  showTextAction: boolean;
  actionText: string;
  showActionIcons: boolean;
  show1stIcon: boolean;
  firstAction: IconName;
  show2ndIcon: boolean;
  secondAction: IconName;
  showBasketHasItem: boolean;
};

const noop = () => undefined;

const meta = {
  title: "Components/Navigation/Toolbar (Top)/Toolbar Top Search",
  args: {
    state: "Default",
    showLeftButton: true,
    leftIcon: "arrow_back",
    showSearch: true,
    showActions: true,
    showTextAction: true,
    actionText: "SKIP",
    showActionIcons: true,
    show1stIcon: true,
    firstAction: "radio_button_unchecked",
    show2ndIcon: true,
    secondAction: "radio_button_unchecked",
    showBasketHasItem: true,
  },
  render: (args) => (
    <div className="max-w-405 bg-surface-secondary">
      <ToolbarTopSearch
        search={args.showSearch ? { label: "Search", placeholder: "Search" } : undefined}
        leftAction={
          args.showLeftButton ? { icon: args.leftIcon, label: "Back", onClick: noop } : undefined
        }
        textAction={
          args.showActions && args.showTextAction
            ? { label: args.actionText, onClick: noop }
            : undefined
        }
        actions={
          args.showActions && args.showActionIcons
            ? [
                ...(args.show1stIcon
                  ? [
                      {
                        icon: args.firstAction,
                        label: "First action",
                        onClick: noop,
                      },
                    ]
                  : []),
                ...(args.show2ndIcon
                  ? [
                      {
                        icon: args.secondAction,
                        label: args.showBasketHasItem ? "Second action, 2 items" : "Second action",
                        badge: args.showBasketHasItem ? 2 : undefined,
                        onClick: noop,
                      },
                    ]
                  : []),
              ]
            : undefined
        }
        scrolled={args.state === "Swipe Down"}
      />
    </div>
  ),
  parameters: {
    controls: {
      include: [
        "state",
        "showLeftButton",
        "leftIcon",
        "showSearch",
        "showActions",
        "showTextAction",
        "actionText",
        "showActionIcons",
        "show1stIcon",
        "firstAction",
        "show2ndIcon",
        "secondAction",
        "showBasketHasItem",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Always show the left navigation button on inner screens for back access",
        'Use Main Title to reflect the current screen context (e.g. "Order Details", "Wishlist")',
        "Keep action icons to a maximum of 2 for visual clarity",
        'Use Text Action for contextual operations like "Skip", "Done", or "Edit"',
      ],
      dont: [
        "Don't overload actions — choose either Text Action or Icon Actions, rarely both",
        "Don't leave Main Title as placeholder text — always set contextual titles",
        "Don't hide the Left Button on inner pages — users need a clear way back",
      ],
    },
    docs: {
      description: {
        component:
          "A contextual navigation bar positioned at the top of inner screens, providing back navigation, search access, and contextual actions.",
      },
    },
  },
  argTypes: {
    state: {
      description: "Figma `State`. In code: `scrolled` (Swipe Down).",
      control: "inline-radio",
      options: ["Default", "Swipe Down"],
      table: { type: { summary: "string" }, defaultValue: { summary: "Default" } },
    },
    showSearch: {
      description: "Figma `Show Search`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLeftButton: {
      description: "Figma `Show Left Button`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftButton" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "arrow_back" } },
    },
    showActions: {
      description: "Figma `Show Actions`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showTextAction: {
      description: "Figma `Show Text Action`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    actionText: {
      description: "Figma `Action Text`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "SKIP" } },
    },
    showActionIcons: {
      description: "Figma `Show Action icons`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    show1stIcon: {
      description: "Figma `Show 1st Icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    firstAction: {
      description: "Figma `1st Action`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "show1stIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
    show2ndIcon: {
      description: "Figma `Show 2nd Icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    secondAction: {
      description: "Figma `2nd Action`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "show2ndIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "radio_button_unchecked" } },
    },
    showBasketHasItem: {
      description: "Figma `Show Basket Has Item`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};
