import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "@/components/ui/icon/icon-names";
import {
  BOTTOM_NAVIGATION_ITEMS,
  BottomNavigation,
  type BottomNavigationProps,
} from "./bottom-navigation";

/** Figma's `Show` booleans. Storybook only: in code a tab shows when it is in `items`. */
type Args = {
  activeTab: NonNullable<BottomNavigationProps["activeTab"]>;
  showBottomSpacer: boolean;
  showTab1: boolean;
  tab1Icon: IconName;
  tab1Text: string;
  showTab2: boolean;
  tab2Icon: IconName;
  tab2Text: string;
  showTab3: boolean;
  tab3Icon: IconName;
  tab3Text: string;
  showTab4: boolean;
  tab4Icon: IconName;
  tab4Text: string;
  showTab5: boolean;
  tab5Icon: IconName;
  tab5Text: string;
  showBasketBadge: boolean;
  showLabels: boolean;
};

const ACTIVE_TABS = BOTTOM_NAVIGATION_ITEMS.map((item) => item.id);
const WITH_CART = BOTTOM_NAVIGATION_ITEMS.map((item) =>
  item.id === "basket" ? { ...item, count: 2 } : item,
);

const meta = {
  title: "Components/Navigation/Bottom Navigation",
  // The defaults of Figma's `Bottom Navigation` and `.Base Bottom Navigation`.
  args: {
    activeTab: "home",
    showBottomSpacer: true,
    showTab1: true,
    tab1Icon: "home",
    tab1Text: "Home",
    showTab2: true,
    tab2Icon: "dashboard",
    tab2Text: "Categories",
    showTab3: true,
    tab3Icon: "shopping_basket",
    tab3Text: "Cart",
    showTab4: true,
    tab4Icon: "favorite",
    tab4Text: "Favourites",
    showTab5: true,
    tab5Icon: "account_circle",
    tab5Text: "Account",
    showBasketBadge: true,
    showLabels: true,
  },
  render: ({ activeTab, showBottomSpacer, showBasketBadge, showLabels, ...tabs }) => {
    const items = BOTTOM_NAVIGATION_ITEMS.flatMap((item, index) => {
      const n = index + 1;
      const show = tabs[`showTab${n}` as keyof typeof tabs] as boolean;
      if (!show) return [];
      return [
        {
          ...item,
          icon: tabs[`tab${n}Icon` as keyof typeof tabs] as IconName,
          label: tabs[`tab${n}Text` as keyof typeof tabs] as string,
          count: item.id === "basket" && showBasketBadge ? 2 : undefined,
        },
      ];
    });
    return (
      <BottomNavigation
        items={items}
        activeTab={activeTab}
        showLabels={showLabels}
        bottomSpacer={showBottomSpacer}
      />
    );
  },
  // Fixed to the viewport bottom; hidden from 1024px up, so view it at 375 or 744.
  parameters: {
    layout: "fullscreen",
    // The Figma properties: Active Tab, Show Bottom Spacer, Show Tab-n / Tab-n Icon / Tab-n Text,
    // Show Basket Badge, Show Labels.
    controls: {
      include: [
        "activeTab",
        "showBottomSpacer",
        "showTab1",
        "tab1Icon",
        "tab1Text",
        "showTab2",
        "tab2Icon",
        "tab2Text",
        "showTab3",
        "tab3Icon",
        "tab3Text",
        "showTab4",
        "tab4Icon",
        "tab4Text",
        "showTab5",
        "tab5Icon",
        "tab5Text",
        "showBasketBadge",
        "showLabels",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Limit to 5 tabs maximum for optimal touch targets",
        "Show badge on Cart only when items are present",
        "Keep labels concise — single word preferred",
        "Use Bottom Spacer for devices with home indicators (iPhone, Android gesture nav)",
      ],
      dont: [
        "Don't use on desktop — this is a mobile-only pattern",
        "Don't hide labels unless space is critically limited",
        "Don't add more than 5 tabs — prioritize key destinations",
        "Don't use for secondary or contextual actions",
      ],
    },
    docs: {
      description: {
        component:
          "A fixed mobile navigation bar positioned at the bottom of the screen, providing quick access to primary app sections with icon and label tabs.",
      },
    },
  },
  argTypes: {
    activeTab: {
      description: "Figma `Active Tab`: the current page's tab, filled and `aria-current`.",
      control: "inline-radio",
      options: ACTIVE_TABS,
      table: {
        type: { summary: ACTIVE_TABS.map((id) => `"${id}"`).join(" | ") },
        defaultValue: { summary: "home" },
      },
    },
    showBottomSpacer: {
      description: "Figma `Show Bottom Spacer`. In code: `bottomSpacer`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showTab1: {
      description: "Figma `Show Tab-1`. In code: leave the tab out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    tab1Icon: {
      description: "Figma `Tab-1 Icon`: a Material Symbols name. In code: `items[0].icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showTab1" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "home" } },
    },
    tab1Text: {
      description: "Figma `Tab-1 Text`. In code: `items[0].label`.",
      control: "text",
      if: { arg: "showTab1" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Home" } },
    },
    showTab2: {
      description: "Figma `Show Tab-2`. In code: leave the tab out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    tab2Icon: {
      description: "Figma `Tab-2 Icon`: a Material Symbols name. In code: `items[1].icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showTab2" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "dashboard" } },
    },
    tab2Text: {
      description: "Figma `Tab-2 Text`. In code: `items[1].label`.",
      control: "text",
      if: { arg: "showTab2" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Categories" } },
    },
    showTab3: {
      description: "Figma `Show Tab-3`. In code: leave the tab out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    tab3Icon: {
      description: "Figma `Tab-3 Icon`: a Material Symbols name. In code: `items[2].icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showTab3" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "shopping_basket" } },
    },
    tab3Text: {
      description: "Figma `Tab-3 Text`. In code: `items[2].label`.",
      control: "text",
      if: { arg: "showTab3" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Cart" } },
    },
    showTab4: {
      description: "Figma `Show Tab-4`. In code: leave the tab out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    tab4Icon: {
      description: "Figma `Tab-4 Icon`: a Material Symbols name. In code: `items[3].icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showTab4" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "favorite" } },
    },
    tab4Text: {
      description: "Figma `Tab-4 Text`. In code: `items[3].label`.",
      control: "text",
      if: { arg: "showTab4" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Favourites" } },
    },
    showTab5: {
      description: "Figma `Show Tab-5`. In code: leave the tab out of `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    tab5Icon: {
      description: "Figma `Tab-5 Icon`: a Material Symbols name. In code: `items[4].icon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showTab5" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "account_circle" } },
    },
    tab5Text: {
      description: "Figma `Tab-5 Text`. In code: `items[4].label`.",
      control: "text",
      if: { arg: "showTab5" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Account" } },
    },
    showBasketBadge: {
      description: "Figma `Show Basket Badge`. In code: a `count` on the basket item (here 2).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabels: {
      description: "Figma `Show Labels`. Hidden labels stay as the links' accessible names.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-320">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Quick access to the primary sections on mobile, here Home active with the basket badge. */
export const Default: Story = {};

/** Every Figma `Active Tab` value (static here, so all five fit on one page). */
export const ActiveTabs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      {BOTTOM_NAVIGATION_ITEMS.map((item) => (
        <BottomNavigation
          key={item.id}
          items={WITH_CART}
          activeTab={item.id}
          labels={{ nav: `Main, ${item.label} active` }}
          className="static"
        />
      ))}
    </div>
  ),
};

/** `Show Basket Badge=false`: an empty cart. */
export const EmptyCart: Story = { args: { showBasketBadge: false } };

/** `Show Labels=false` (Figma Don't unless space is critically limited): names stay for screen readers. */
export const WithoutLabels: Story = { args: { showLabels: false } };

/** `Show Bottom Spacer=false`: devices without a home indicator. */
export const WithoutBottomSpacer: Story = { args: { showBottomSpacer: false } };
