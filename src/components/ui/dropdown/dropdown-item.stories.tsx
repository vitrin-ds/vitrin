import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { DropdownItem } from "./dropdown-item";

/** Figma's `State` and `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  state: "Default" | "Hover" | "Active" | "Disabled";
  itemText: string;
  showAvatar: boolean;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showRightIcon: boolean;
  rightIcon: IconName;
};

const FLAG = "/brand/flags/be.svg";

const meta = {
  title: "Components/Inputs/Dropdown/Dropdown Item",
  // The defaults of Figma's `.Base Dropdown Item`.
  args: {
    state: "Default",
    itemText: "Dropdown item",
    showAvatar: true,
    showLeftIcon: true,
    leftIcon: "radio_button_unchecked",
    showRightIcon: true,
    rightIcon: "check_circle",
  },
  render: ({ state, itemText, showAvatar, showLeftIcon, leftIcon, showRightIcon, rightIcon }) => (
    <ul
      role="listbox"
      aria-label="Options"
      className="max-w-334 rounded-8 bg-surface-raised shadow-md"
    >
      <DropdownItem
        label={itemText}
        highlighted={state === "Hover"}
        selected={state === "Active"}
        disabled={state === "Disabled"}
        image={showAvatar ? FLAG : undefined}
        icon={showLeftIcon ? (state === "Active" ? "radio_button_checked" : leftIcon) : undefined}
        rightIcon={showRightIcon ? rightIcon : undefined}
      />
    </ul>
  ),
  parameters: {
    controls: {
      include: [
        "state",
        "itemText",
        "showAvatar",
        "showLeftIcon",
        "leftIcon",
        "showRightIcon",
        "rightIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Keep item text concise and scannable",
        "Use left icon to indicate selection type (radio for single, checkbox for multi)",
        "Use right icon (check) to confirm selected state",
        "Include avatar when items represent people or entities",
      ],
      dont: [
        "Don't mix selection patterns within the same dropdown list",
        "Don't truncate item text — ensure adequate width",
        "Don't disable items without clear reason",
        "Don't overload items with too many visual elements at once",
      ],
    },
    docs: {
      description: {
        component:
          "An individual selectable option within a dropdown list, supporting single or multi-select patterns with optional visual elements.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`. In code: `highlighted`, `selected`, `disabled`; in a Dropdown these come from the list.",
      control: "inline-radio",
      options: ["Default", "Hover", "Active", "Disabled"],
      table: { type: { summary: "string" }, defaultValue: { summary: "Default" } },
    },
    itemText: {
      description: "Figma `Item Text`. In code: `label`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Dropdown item" } },
    },
    showAvatar: {
      description: "Figma `Show Avatar`. In code: pass `image`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `icon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: { type: { summary: "IconName" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: pass `rightIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** All four states of Figma's main layer. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul
      role="listbox"
      aria-label="Options"
      className="max-w-334 rounded-8 bg-surface-raised shadow-md"
    >
      {(
        [
          ["Default", {}],
          ["Hover", { highlighted: true }],
          ["Active", { selected: true }],
          ["Disabled", { disabled: true }],
        ] as const
      ).map(([label, state]) => (
        <DropdownItem
          key={label}
          label={label}
          image={FLAG}
          icon={label === "Active" ? "radio_button_checked" : "radio_button_unchecked"}
          rightIcon="check_circle"
          {...state}
        />
      ))}
    </ul>
  ),
};
