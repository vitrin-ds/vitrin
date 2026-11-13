import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ICON_NAMES, type IconName } from "@/components/ui/icon/icon-names";
import {
  HeaderActions,
  HeaderSearch,
  STORY_HEADER_LABELS,
  StoryLogo,
} from "./header.story-helpers";
import { MainHeader, MainHeaderAction } from "./main-header";

const noop = () => undefined;

const meta = {
  title: "Components/Navigation/Header & Navigation Bar/Main Header [Search]",
  component: MainHeader,
  args: {
    logo: <StoryLogo />,
    labels: STORY_HEADER_LABELS,
    search: <HeaderSearch />,
    actions: <HeaderActions />,
    onMenuClick: fn(),
    menuExpanded: false,
  },
  parameters: {
    figma: {
      do: [
        "Keep logo prominent and consistently positioned",
        "Make search easily accessible across all breakpoints",
        "Show cart badge only when items are present",
        "Use Inner Search for desktop, Bottom Search for mobile",
      ],
      dont: [
        "Don't hide essential actions (cart, account) on any breakpoint",
        "Don't overload with too many action items — prioritize key actions",
        "Don't use both logo variants simultaneously",
        "Don't hide search entirely — it's critical for e-commerce",
      ],
    },
    layout: "fullscreen",
    // Only Default has controls. Breakpoint is responsive (CSS).
    controls: { disable: true },
    docs: {
      description: {
        component: "The brand row of the header: menu trigger, logo, search and action icons.",
      },
    },
  },
} satisfies Meta<typeof MainHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

type DefaultArgs = {
  showMenuTrigger: boolean;
  showSearch: boolean;
  showRight: boolean;
  showItem1: boolean;
  item1Icon: IconName;
  item1Text: string;
  item1ShowLabel: boolean;
  showItem2: boolean;
  item2Icon: IconName;
  item2Text: string;
  item2ShowLabel: boolean;
  showItem3: boolean;
  item3Icon: IconName;
  item3Text: string;
  item3ShowLabel: boolean;
  showItem4: boolean;
  item4Icon: IconName;
  item4Text: string;
  item4ShowLabel: boolean;
  showRightIcon: boolean;
  showBadge: boolean;
};

const HREFS = ["/stores", "/login", "/account/saved", "/cart"] as const;

/**
 * Figma `Main Header [Search]` (30558:5175): one row from 1024px; menu trigger, logo and icons
 * over the full-width search below. `Text Input [Inner Search]` and `[Bottom Search]` are one
 * field that moves with the breakpoint, so one control. The logo has no control on purpose.
 */
export const Default: StoryObj<DefaultArgs> = {
  args: {
    showMenuTrigger: true,
    showSearch: true,
    showRight: true,
    showItem1: true,
    item1Icon: "location_on",
    item1Text: "Find a Store",
    item1ShowLabel: true,
    showItem2: true,
    item2Icon: "account_circle",
    item2Text: "Sign In / Register",
    item2ShowLabel: true,
    showItem3: true,
    item3Icon: "favorite",
    item3Text: "Wishlist",
    item3ShowLabel: false,
    showItem4: true,
    item4Icon: "shopping_basket",
    item4Text: "Cart",
    item4ShowLabel: false,
    showRightIcon: false,
    showBadge: true,
  },
  parameters: {
    controls: {
      disable: false,
      include: [
        "showMenuTrigger",
        "showSearch",
        "showRight",
        "showItem1",
        "item1Icon",
        "item1Text",
        "item1ShowLabel",
        "showItem2",
        "item2Icon",
        "item2Text",
        "item2ShowLabel",
        "showItem3",
        "item3Icon",
        "item3Text",
        "item3ShowLabel",
        "showItem4",
        "item4Icon",
        "item4Text",
        "item4ShowLabel",
        "showRightIcon",
        "showBadge",
      ],
    },
  },
  argTypes: {
    showMenuTrigger: {
      description:
        "Figma `Show .Asset Main Header Item [Menu Trigger]`, below 1024px. In code: pass `onMenuClick`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showSearch: {
      description:
        "Figma `Show Text Input [Inner Search]` and `[Bottom Search]`. In code: pass `search`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showRight: {
      description: "Figma `Show Right`. In code: pass `actions`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem1: {
      description: "Figma `Show .Asset Main Header [Search] Item [1]`.",
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
      description: "Figma `Label Text` of item 1.",
      control: "text",
      if: { arg: "showItem1" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Find a Store" } },
    },
    item1ShowLabel: {
      description: "Figma `Show Label` of item 1. In code: `hideLabel`.",
      control: "boolean",
      if: { arg: "showItem1" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem2: {
      description: "Figma `Show .Asset Main Header [Search] Item [2]`.",
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
      description: "Figma `Label Text` of item 2.",
      control: "text",
      if: { arg: "showItem2" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Sign In / Register" } },
    },
    item2ShowLabel: {
      description: "Figma `Show Label` of item 2. In code: `hideLabel`.",
      control: "boolean",
      if: { arg: "showItem2" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showItem3: {
      description: "Figma `Show .Asset Main Header [Search] Item [3]`.",
      control: "boolean",
      if: { arg: "showRight" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    item3Icon: {
      description: "Figma `Left Icon` of item 3.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showItem3" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "favorite" } },
    },
    item3Text: {
      description: "Figma `Label Text` of item 3.",
      control: "text",
      if: { arg: "showItem3" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Wishlist" } },
    },
    item3ShowLabel: {
      description: "Figma `Show Label` of item 3. In code: `hideLabel`.",
      control: "boolean",
      if: { arg: "showItem3" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    showItem4: {
      description: "Figma `Show .Asset Main Header [Search] Item [4]`.",
      control: "boolean",
      if: { arg: "showRight" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    item4Icon: {
      description: "Figma `Left Icon` of item 4.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showItem4" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "shopping_basket" } },
    },
    item4Text: {
      description: "Figma `Label Text` of item 4.",
      control: "text",
      if: { arg: "showItem4" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Cart" } },
    },
    item4ShowLabel: {
      description: "Figma `Show Label` of item 4. In code: `hideLabel`.",
      control: "boolean",
      if: { arg: "showItem4" },
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon` on the items, from 1024px. In code: `chevron`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    showBadge: {
      description: "Figma `Show Badge` on the last item. In code: `count`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  render: (args) => {
    const shown = [1, 2, 3, 4].filter((n) => args[`showItem${n}` as "showItem1"]);
    return (
      <MainHeader
        logo={<StoryLogo />}
        labels={STORY_HEADER_LABELS}
        search={args.showSearch ? <HeaderSearch /> : undefined}
        onMenuClick={args.showMenuTrigger ? noop : undefined}
        menuExpanded={false}
        actions={
          args.showRight && shown.length > 0 ? (
            <>
              {shown.map((n) => (
                <MainHeaderAction
                  key={n}
                  icon={args[`item${n}Icon` as "item1Icon"]}
                  label={args[`item${n}Text` as "item1Text"]}
                  hideLabel={!args[`item${n}ShowLabel` as "item1ShowLabel"]}
                  href={HREFS[n - 1]}
                  chevron={args.showRightIcon}
                  count={n === 4 && args.showBadge ? 2 : undefined}
                />
              ))}
            </>
          ) : undefined
        }
      />
    );
  },
};

/** Figma Do: "Show cart badge only when items are present". */
export const EmptyCart: Story = { args: { actions: <HeaderActions cartCount={0} /> } };

/** Badge over 99. */
export const ManyItems: Story = { args: { actions: <HeaderActions cartCount={120} /> } };

/** Without a menu trigger (no `onMenuClick`) and without search. */
export const LogoAndActions: Story = { args: { onMenuClick: undefined, search: undefined } };

/**
 * Checkout (Figma WD/WT/WM.09.03.* header): the logo and one static item, "Secure Checkout"
 * with the lock glyph. No search, menu or cart (Main Header [Compact] Do: reduce cognitive load).
 */
export const Checkout: Story = {
  args: {
    onMenuClick: undefined,
    search: undefined,
    actions: <MainHeaderAction icon="lock" label="Secure Checkout" />,
  },
};
