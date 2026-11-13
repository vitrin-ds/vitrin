import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MAKE_UP_MENU } from "./header.fixtures";
import { MegaMenu } from "./mega-menu";
import { MegaMenuBrandGrid } from "./mega-menu-showcases";
import { MegaMenuStage, TRENDING_BRANDS } from "./mega-menu.story-helpers";

type Args = {
  asideTitle: string;
  brandCount: number;
  showFooter: boolean;
  footerText: string;
};

const meta = {
  title: "Components/Navigation/Mega Menu/Trending Brand Showcase",
  args: {
    asideTitle: "Trending Brands",
    brandCount: 12,
    showFooter: true,
    footerText: String(MAKE_UP_MENU.footer ?? ""),
  },
  parameters: {
    layout: "fullscreen",
    figma: {
      do: [
        "Use this variant for brand-heavy verticals where brand loyalty drives purchasing (beauty, fashion, sports)",
        "Keep the brand grid balanced — aim for rows of 4 on desktop and 3 on mobile",
        "Ensure brand logos are visually consistent in size and contrast within the circular containers",
        "Rotate featured brands based on campaigns, seasonality, or partnership deals",
      ],
      dont: [
        "Don't mix brand cards and product cards in the same showcase zone — use the Trending Product Showcase variant instead",
        "Don't display brands without logos — the circular format relies on visual recognition",
        'Don\'t exceed 12 brands on desktop — too many dilutes the "trending" curation',
        "Don't place the brand grid inside the accordion on mobile — keep it as a separate section for visibility",
      ],
    },
    docs: {
      description: {
        component:
          "A hybrid dropdown navigation panel that combines category link columns with a branded showcase grid, spotlighting key brands to drive brand-driven discovery alongside traditional category navigation.",
      },
    },
  },
  argTypes: {
    asideTitle: { description: "Figma Title Item `Label Text`.", control: "text" },
    brandCount: {
      description: "Brand cards. Figma: no more than 12 on desktop, in rows of 4.",
      control: { type: "range", min: 4, max: 12, step: 4 },
    },
    showFooter: { description: "The `Menu Footer`. In code: pass `footer`.", control: "boolean" },
    footerText: {
      description: "The `Menu Footer` text.",
      control: "text",
      if: { arg: "showFooter" },
    },
  },
  render: (args) => (
    <MegaMenuStage>
      <MegaMenu
        columns={MAKE_UP_MENU.columns.slice(0, 3)}
        footer={args.showFooter ? args.footerText : undefined}
        aside={{
          title: args.asideTitle,
          size: "brands",
          content: (
            <MegaMenuBrandGrid
              label={args.asideTitle}
              brands={TRENDING_BRANDS.slice(0, args.brandCount)}
            />
          ),
        }}
      />
    </MegaMenuStage>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Mega Menu [Trending Brand Showcase]` (30677:12496): three columns, twelve brands. */
export const Default: Story = {};
