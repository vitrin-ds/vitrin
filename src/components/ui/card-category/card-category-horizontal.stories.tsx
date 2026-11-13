import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import {
  CardCategoryHorizontal,
  type CardCategoryHorizontalProps,
} from "./card-category-horizontal";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: CardCategoryHorizontalProps["color"];
  titleText: string;
  showIcon: boolean;
  showBottom: boolean;
  icon: IconName;
  showProductCount: boolean;
  count: number;
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
  title: "Patterns/Discovery/Category Cards/Category Card Horizontal",
  // The defaults of Figma's `.Base.Card.Category.Horizontal`. The count is the number in
  // "[Count] Products".
  args: {
    color: "brand",
    titleText: "Aureline Glow Activating Serum",
    showIcon: true,
    showBottom: true,
    icon: "keyboard_arrow_right",
    showProductCount: true,
    count: 128,
  },
  render: ({ color, titleText, showBottom, showIcon, icon, showProductCount, count }) => (
    <div className="max-w-368">
      <CardCategoryHorizontal
        {...BASE}
        color={color}
        title={titleText}
        showBottom={showBottom}
        rightIcon={showIcon ? icon : null}
        productCount={showProductCount ? count : undefined}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Category.Horizontal: Color, then the Base ones. State (Default,
    // Hover & Tap) is a CSS state.
    controls: {
      include: [
        "color",
        "titleText",
        "showBottom",
        "showIcon",
        "icon",
        "showProductCount",
        "count",
      ],
    },
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
          "A horizontal category card with an image area and a bottom label section — used in mega menu subcategory showcases, category carousels, and grid-based category navigation. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    showBottom: {
      description: "Figma `Show Bottom`. In code: `showBottom`. Hides the name, count and icon.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    color: {
      description: "Figma `Color`. In code: `color`. The card background theme.",
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
    showIcon: {
      description: "Figma `Show Icon`. In code: `rightIcon` (`null` hides it).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    icon: {
      description: "Figma `Icon`. In code: `rightIcon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "keyboard_arrow_right" } },
    },
    showProductCount: {
      description: "Figma `Show Product Count`. In code: pass `productCount`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    count: {
      description:
        "Figma `Count` (“[Count] Products”). In code: `productCount`, a number; the text is built from it.",
      control: "number",
      if: { arg: "showProductCount" },
      table: { type: { summary: "number" }, defaultValue: { summary: "128" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** Figma `Card.Category.Horizontal`: Mega Menu subcategory showcases and homepage category sections. */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
      <CardCategoryHorizontal {...BASE} productCount={128} />
      <CardCategoryHorizontal {...BASE} color="white" productCount={1} />
      <CardCategoryHorizontal {...BASE} image={undefined} title="Aureline Glow Activating Serums" />
    </div>
  ),
};
