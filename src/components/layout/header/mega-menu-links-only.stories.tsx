import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MAKE_UP_MENU } from "./header.fixtures";
import { MegaMenu } from "./mega-menu";
import { MegaMenuStage } from "./mega-menu.story-helpers";

type Args = {
  titleText: string;
  linkText: string;
  showActions: boolean;
  actionText: string;
  showActionIcon: boolean;
  showFooter: boolean;
  footerText: string;
};

const FIRST_GROUP = MAKE_UP_MENU.columns[0]![0]!;

const meta = {
  title: "Components/Navigation/Mega Menu/Links Only",
  args: {
    titleText: FIRST_GROUP.title,
    linkText: FIRST_GROUP.links[0]!.label,
    showActions: true,
    actionText: FIRST_GROUP.actions?.[0]?.label ?? "Show All Products",
    showActionIcon: true,
    showFooter: true,
    footerText: String(MAKE_UP_MENU.footer ?? ""),
  },
  parameters: {
    layout: "fullscreen",
    figma: {
      do: [
        "Adjust column count to match the actual number of top-level categories",
        "Keep category groups balanced — avoid one column with 15 items next to one with 3",
        'Use "Show All Products" and category page links consistently across all groups',
        "Maintain the same information hierarchy between desktop and mobile views",
      ],
      dont: [
        "Don't exceed 7–8 columns on desktop — beyond that, scannability drops significantly",
        "Don't deeply nest subcategories — keep the hierarchy flat (group → links)",
        "Don't omit the mobile accordion pattern — horizontal column layouts don't work on small screens",
        "Don't mix link-only and image-based mega menu styles within the same navigation",
      ],
    },
    docs: {
      description: {
        component:
          "A full-width dropdown navigation panel that organizes product categories into a multi-column link structure for desktop, transforming into an accordion-based drill-down pattern on mobile.",
      },
    },
  },
  argTypes: {
    titleText: { description: "Figma Title Item `Label Text`.", control: "text" },
    linkText: { description: "Figma Link Item `Label Text` (`Size=Default`).", control: "text" },
    showActions: {
      description: "The `Size=Small` Link Items. In code: `actions` on the group.",
      control: "boolean",
    },
    actionText: {
      description: "Figma Link Item `Label Text` (`Size=Small`).",
      control: "text",
      if: { arg: "showActions" },
    },
    showActionIcon: {
      description: "Figma Link Item `Show Right Icon`. In code: `hideRightIcon`.",
      control: "boolean",
      if: { arg: "showActions" },
    },
    showFooter: { description: "The `Menu Footer`. In code: pass `footer`.", control: "boolean" },
    footerText: {
      description: "The `Menu Footer` text.",
      control: "text",
      if: { arg: "showFooter" },
    },
  },
  render: (args) => {
    const group = {
      ...FIRST_GROUP,
      title: args.titleText,
      links: FIRST_GROUP.links.map((link, i) =>
        i === 0 ? { ...link, label: args.linkText } : link,
      ),
      actions: args.showActions
        ? FIRST_GROUP.actions?.map((link, i) =>
            i === 0
              ? { ...link, label: args.actionText, hideRightIcon: !args.showActionIcon }
              : link,
          )
        : undefined,
    };
    const [first, ...rest] = MAKE_UP_MENU.columns;
    return (
      <MegaMenuStage>
        <MegaMenu
          {...MAKE_UP_MENU}
          columns={[[group, ...first!.slice(1)], ...rest]}
          footer={args.showFooter ? args.footerText : undefined}
        />
      </MegaMenuStage>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Mega Menu [Links Only] / Large` (30677:8834): five columns and the Menu Footer. */
export const Default: Story = {};
