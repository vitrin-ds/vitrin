import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CardCategoryHorizontalSmall,
  type CardCategoryHorizontalSmallProps,
} from "./card-category-horizontal-small";

/** Figma's text properties. Storybook only. */
type Args = {
  color: CardCategoryHorizontalSmallProps["color"];
  titleText: string;
};

const COLORS = ["brand", "white"] as const;

const WIDE = {
  src: "/dev/sample-wide.webp",
  alt: "Skincare bottles on a bathroom shelf",
  width: 1600,
  height: 900,
};
const BASE = { title: "Serums", href: "/c/skincare/serums", image: WIDE };

const meta = {
  title: "Patterns/Discovery/Category Cards/Category Card Horizontal Small",
  // The defaults of Figma's `.Base.Card.Category.Horizontal.Small`.
  args: { color: "brand", titleText: "Aureline Glow Activating Serum" },
  render: ({ color, titleText }) => (
    <div className="max-w-244">
      <CardCategoryHorizontalSmall {...BASE} color={color} title={titleText} />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Category.Horizontal.Small: Color, Title Text. State (Default,
    // Hover & Tap) is a CSS state.
    controls: { include: ["color", "titleText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use in Mega Menu [Subcategory Showcase] grids and homepage category sections",
        "Use the Icon as a navigation affordance to indicate the card links to a category page",
        "Hide the Bottom section when the image itself is self-explanatory (e.g., branded imagery with text overlay)",
        "Keep Title Text concise — single line preferred",
      ],
      dont: [
        "Don't use for product cards — this is strictly for category/subcategory navigation",
        "Don't hide both Bottom and Icon — the card needs at least one text or action element",
        "Don't use for editorial hero placements — use Card.Category.Vertical.Featured instead",
        "Don't mix with Card.Category.Circle in the same grid — choose one card style per section",
      ],
    },
    docs: {
      description: {
        component:
          "A horizontal category card with an image area and a bottom label section — used in mega menu subcategory showcases, category carousels, and grid-based category navigation. This is the compact version. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    color: {
      description:
        "Figma `Color` (Default · Brand · White). In code: `color`. Figma's Default and Brand are the same fill: `brand`.",
      control: "inline-radio",
      options: COLORS,
      table: { type: { summary: '"brand" | "white"' }, defaultValue: { summary: "brand" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Aureline Glow Activating Serum" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** Figma `Card.Category.Horizontal.Small`: the compact horizontal card for the same places. */
export const HorizontalSmall: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-8 desktop:grid-cols-5">
      <CardCategoryHorizontalSmall {...BASE} />
      <CardCategoryHorizontalSmall {...BASE} color="white" />
      <CardCategoryHorizontalSmall
        {...BASE}
        image={undefined}
        title="Aureline Glow Activating Serums and Boosters"
      />
    </div>
  ),
};
