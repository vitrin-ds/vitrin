import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "@/components/ui/icon/icon-names";
import { MainHeaderCompact, MainHeaderCompactAction } from "./main-header-compact";

/** Figma's properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showBack: boolean;
  backText: string;
  showRight: boolean;
  showItem1: boolean;
  item1Icon: IconName;
  item1Text: string;
  showItem2: boolean;
  item2Icon: IconName;
  item2Text: string;
  showLabel: boolean;
  showRightIcon: boolean;
};

const meta = {
  title: "Components/Navigation/Header & Navigation Bar/Main Header [Compact]",
  args: {
    showBack: true,
    backText: "Back",
    showRight: true,
    showItem1: true,
    item1Icon: "location_on",
    item1Text: "Find a Store",
    showItem2: true,
    item2Icon: "account_circle",
    item2Text: "Account",
    showLabel: false,
    showRightIcon: false,
  },
  render: (args) => {
    const item = (icon: IconName, label: string, href: string) => (
      <MainHeaderCompactAction
        icon={icon}
        label={label}
        href={href}
        showLabel={args.showLabel}
        chevron={args.showRightIcon}
      />
    );
    return (
      <MainHeaderCompact
        backHref={args.showBack ? "/" : undefined}
        backLabel={args.backText}
        actions={
          args.showRight && (args.showItem1 || args.showItem2) ? (
            <>
              {args.showItem1 && item(args.item1Icon, args.item1Text, "/stores")}
              {args.showItem2 && item(args.item2Icon, args.item2Text, "/account")}
            </>
          ) : undefined
        }
      />
    );
  },
  parameters: {
    layout: "fullscreen",
    // Show Logo is left out on purpose: the code has no logo here. Breakpoint is responsive (CSS).
    controls: {
      include: [
        "showBack",
        "backText",
        "showRight",
        "showItem1",
        "item1Icon",
        "item1Text",
        "showItem2",
        "item2Icon",
        "item2Text",
        "showLabel",
        "showRightIcon",
      ],
    },
    docs: {
      description: {
        component:
          "A reduced header for focused flows such as sign in and registration: a back link and a few icon actions.",
      },
    },
  },
  argTypes: {
    showBack: {
      description: "Figma `Show Item [Back]`. In code: pass `backHref`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    backText: {
      description: "Figma `Label Text` of the back item.",
      control: "text",
      if: { arg: "showBack" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Back" } },
    },
    showRight: {
      description: "Figma `Show Right`. In code: pass `actions`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem1: {
      description:
        "Figma `Show .Asset Main Header [Compact] Item [1]`: the store locator (`location_on`).",
      control: "boolean",
      if: { arg: "showRight" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    item1Icon: {
      description: "Figma `Left Icon` of item 1.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showItem1" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "location_on" } },
    },
    item1Text: {
      description: "Figma `Label Text` of item 1; always the accessible name.",
      control: "text",
      if: { arg: "showItem1" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Find a Store" } },
    },
    showItem2: {
      description:
        "Figma `Show .Asset Main Header [Compact] Item [2]`: the account item (`account_circle`).",
      control: "boolean",
      if: { arg: "showRight" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    item2Icon: {
      description: "Figma `Left Icon` of item 2.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showItem2" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "account_circle" } },
    },
    item2Text: {
      description: "Figma `Label Text` of item 2; always the accessible name.",
      control: "text",
      if: { arg: "showItem2" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Account" } },
    },
    showLabel: {
      description: "Figma `Show Label` on the items: from 744px.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon` on the items. In code: `chevron`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
  decorators: [
    (Story) => (
      <header>
        <Story />
      </header>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Main Header [Compact]` as the 01 Login / 02 Register frames use it: Back + store locator. */
export const Default: Story = {};

/** Back link only. */
export const BackOnly: Story = { args: { showRight: false } };
