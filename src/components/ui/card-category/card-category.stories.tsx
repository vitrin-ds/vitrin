import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardCategoryVertical, type CardCategoryVerticalProps } from "./card-category-vertical";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  color: CardCategoryVerticalProps["color"];
  titleText: string;
  showIcon: boolean;
  icon: IconName;
};

const COLORS = ["brand", "white"] as const;

const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
const BASE = { title: "Serums", href: "/c/skincare/serums", image: SQUARE };

const toVertical = ({ color, titleText, showIcon, icon }: Args) => ({
  ...BASE,
  color,
  title: titleText,
  rightIcon: showIcon ? icon : null,
});

const meta = {
  title: "Patterns/Discovery/Category Cards/Category Card Vertical",
  // The defaults of Figma's `.Base.Card.Category.Vertical`.
  args: {
    color: "brand",
    titleText: "Category Name",
    showIcon: true,
    icon: "keyboard_arrow_right",
  },
  render: (args) => (
    <div className="max-w-283">
      <CardCategoryVertical {...toVertical(args)} />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Category.Vertical (the example the controls drive): Color, Title
    // Text, Show Icon, Icon. State is a CSS state. The other six cards are separate Figma components,
    // each with its own story file.
    controls: { include: ["color", "titleText", "showIcon", "icon"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Keep Title Text to a single line — truncate or shorten if necessary",
        'Use in category grids, homepage "Shop by Category" sections, and mega menu subcategory areas',
        "Use the Icon as a navigation affordance to signal drill-down",
        "Use the Brand color variant to highlight promoted or seasonal categories",
      ],
      dont: [
        "Don't use multi-line titles — long category names break the card's visual rhythm",
        "Don't hide the Icon on navigable cards — users need the affordance",
        "Don't use for editorial or campaign-driven placements — use Card.Category.Vertical.Featured instead",
        "Don't mix Brand and White variants randomly within the same grid — be intentional",
      ],
    },
    docs: {
      description: {
        component:
          "A standard vertical category card with an image, title label, and optional navigation icon — used for category grids, browsing sections, and subcategory navigation. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    color: {
      description: "Figma `Color`. In code: `color`. The card background theme.",
      control: "inline-radio",
      options: COLORS,
      table: { type: { summary: '"brand" | "white"' }, defaultValue: { summary: "brand" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Category Name" } },
    },
    showIcon: {
      description: "Figma `Show Icon`. In code: pass `rightIcon` (`null` hides it).",
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
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** The standard category card. The first card follows the controls; the others show White, a long name, and no image or icon. */
export const Vertical: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-8 tablet:grid-cols-3 desktop:grid-cols-4">
      <CardCategoryVertical {...toVertical(args)} />
      <CardCategoryVertical {...BASE} color="white" />
      <CardCategoryVertical {...BASE} title="Overnight Renewal Creams and Masks" />
      <CardCategoryVertical {...BASE} image={undefined} rightIcon={null} />
    </div>
  ),
};
