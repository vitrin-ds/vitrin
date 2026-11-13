import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MAKE_UP_MENU } from "./header.fixtures";
import { MegaMenu } from "./mega-menu";
import { MegaMenuProductList } from "./mega-menu-showcases";
import { MegaMenuStage } from "./mega-menu.story-helpers";

const eur = (amount: number) => ({ amount, currency: "EUR" as const });
const PACKSHOT = { src: "/dev/sample-white.webp", alt: "", width: 1024, height: 1024 };
const PRODUCTS = ["Silk Lip Tint", "Restorative Shampoo", "Smoothing Serum", "Velvet Cream"].map(
  (name, i) => ({
    id: `p${i}`,
    name,
    href: "/p/sample",
    image: PACKSHOT,
    price: eur(7000),
    compareAt: i === 0 ? eur(8400) : undefined,
    label: "New",
  }),
);

type Args = {
  asideTitle: string;
  productCount: number;
  showFooter: boolean;
  footerText: string;
};

const meta = {
  title: "Components/Navigation/Mega Menu/Trending Product Showcase",
  args: {
    asideTitle: "Trending Products",
    productCount: 3,
    showFooter: true,
    footerText: String(MAKE_UP_MENU.footer ?? ""),
  },
  parameters: {
    layout: "fullscreen",
    figma: {
      do: [
        "Limit link columns to 3–4 to leave sufficient space for the product showcase zone",
        "Curate the trending products to match the menu's category context (e.g., beauty menu → beauty products)",
        "Use the mobile carousel to maintain product visibility without overwhelming the vertical scroll",
        "Rotate trending products frequently to keep the menu content fresh and conversion-driven",
      ],
      dont: [
        "Don't display more than 3–4 products on desktop — the showcase should complement, not compete with navigation",
        'Don\'t use generic "best sellers" if the menu is category-specific — keep product relevance high',
        "Don't omit pricing from the product cards — price visibility drives impulse engagement",
        "Don't skip the Slider Pagination Bar on mobile — without it, users won't know there are more products to swipe",
      ],
    },
    docs: {
      description: {
        component:
          "A hybrid dropdown navigation panel that combines category link columns with a dedicated trending product zone, driving both navigation and impulse purchase opportunities within the menu itself.",
      },
    },
  },
  argTypes: {
    asideTitle: { description: "Figma Title Item `Label Text`.", control: "text" },
    productCount: {
      description: "Product cards. Figma: no more than 3–4 on desktop.",
      control: { type: "range", min: 1, max: 4 },
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
          content: (
            <MegaMenuProductList
              label={args.asideTitle}
              products={PRODUCTS.slice(0, args.productCount)}
            />
          ),
        }}
      />
    </MegaMenuStage>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Mega Menu [Trending Product Showcase]` (30677:11642): three columns, three products. */
export const Default: Story = {};
