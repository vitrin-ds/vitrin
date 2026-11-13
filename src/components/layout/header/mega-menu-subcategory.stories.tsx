import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MAKE_UP_MENU } from "./header.fixtures";
import { MegaMenu } from "./mega-menu";
import { MegaMenuCategoryGrid } from "./mega-menu-showcases";
import { MegaMenuStage } from "./mega-menu.story-helpers";

const SCENE = { src: "/dev/sample-wide.webp", alt: "", width: 1600, height: 900 };
const SECTIONS = ["Skin Care", "Body Care", "Hair Care", "Make Up"];
const CATEGORIES = [
  "Serums",
  "Cleansers",
  "Moisturisers",
  "Masks",
  "Toners",
  "Eye Care",
  "Sun Care",
  "Lip Care",
];

type Args = {
  showRightIcon: boolean;
  cardCount: number;
  showFooter: boolean;
  footerText: string;
};

const meta = {
  title: "Components/Navigation/Mega Menu/Subcategory Showcase",
  args: {
    showRightIcon: true,
    cardCount: 8,
    showFooter: true,
    footerText: String(MAKE_UP_MENU.footer ?? ""),
  },
  parameters: {
    layout: "fullscreen",
    figma: {
      do: [
        "Use this variant when subcategories benefit from visual representation (e.g., beauty, fashion, home décor)",
        "Keep subcategory card counts balanced across categories for a consistent grid appearance",
        "Highlight the active category in the sidebar to reinforce the user's current selection",
        "Adjust grid columns based on available subcategories — 4 columns is default but not mandatory",
      ],
      dont: [
        "Don't mix this with the Links Only variant within the same navigation — choose one pattern per menu",
        "Don't use for categories with only 1–2 subcategories — the card grid will look sparse",
        "Don't rely solely on images to communicate subcategories — always include a text label",
        "Don't overload with too many cards per category — consider grouping or paginating beyond 8–10 items",
      ],
    },
    docs: {
      description: {
        component:
          "A visually rich dropdown navigation panel that pairs a category sidebar with a grid of image-based subcategory cards, transforming into an accordion-driven layout on mobile.",
      },
    },
  },
  argTypes: {
    showRightIcon: {
      description: "Figma Title Item `Show Right Icon`. In code: `hideRightIcon`.",
      control: "boolean",
    },
    cardCount: {
      description: "Cards per category. Figma: consider grouping beyond 8–10.",
      control: { type: "range", min: 4, max: 8, step: 4 },
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
        columns={[]}
        footer={args.showFooter ? args.footerText : undefined}
        showcase={SECTIONS.map((title) => ({
          id: title,
          title,
          hideRightIcon: !args.showRightIcon,
          content: (
            <MegaMenuCategoryGrid
              label={title}
              categories={CATEGORIES.slice(0, args.cardCount).map((name) => ({
                id: `${title}-${name}`,
                title: name,
                href: "/c/sample",
                image: SCENE,
                productCount: 24,
              }))}
            />
          ),
        }))}
      />
    </MegaMenuStage>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Mega Menu [Subcategory Showcase]` (30621:14514): sidebar tabs over category cards. */
export const Default: Story = {};
