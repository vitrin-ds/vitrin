import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CardCategorySquareSmall,
  type CardCategorySquareSmallProps,
} from "./card-category-square-small";

/** Figma's text properties. Storybook only. */
type Args = {
  color: CardCategorySquareSmallProps["color"];
  titleText: string;
};

const COLORS = ["brand", "white"] as const;

const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
/** A cut-out on transparent: the card's fill shows behind it. */
const PACKSHOT = { src: "/dev/sample-white.webp", alt: "", width: 1024, height: 1024 };
const BASE = { title: "Serums", href: "/c/skincare/serums", image: SQUARE };

const meta = {
  title: "Patterns/Discovery/Category Cards/Category Card Square Small",
  // The defaults of Figma's `.Base.Card.Category.Square.Small`.
  args: { color: "brand", titleText: "Best Sellers" },
  render: ({ color, titleText }) => (
    <div className="max-w-217">
      <CardCategorySquareSmall {...BASE} color={color} title={titleText} />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Category.Square.Small: Color, Title Text. State (Default, Hover &
    // Tap) is a CSS state.
    controls: { include: ["color", "titleText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for compact category grids where many categories need to be shown at once",
        "Keep Title Text to one or two words maximum — the square format has limited text space",
        'Use in mobile "Shop by Category" carousels and homepage quick-access sections',
        "Use the Brand color variant to highlight seasonal or promoted categories",
      ],
      dont: [
        "Don't use long category names — they will overflow or wrap awkwardly in the square format",
        "Don't use for subcategory navigation within mega menus — use Card.Category.Horizontal instead",
        "Don't mix with other category card shapes in the same row — maintain visual consistency",
        "Don't use without imagery — the square format relies on the visual to communicate the category",
      ],
    },
    docs: {
      description: {
        component:
          "A compact square category card with an image and a centered title label — designed for dense category grids, mobile category browsing, and icon-style category navigation. Hover and Tap are CSS states: use the pointer on the example to see them.",
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
      table: { type: { summary: "string" }, defaultValue: { summary: "Best Sellers" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** The cut-out thumbnails of the Home sale grid, on Brand and White. */
export const SquareSmallPackshot: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-480 grid-cols-2 gap-8">
      <CardCategorySquareSmall {...BASE} image={PACKSHOT} media="packshot" />
      <CardCategorySquareSmall {...BASE} image={PACKSHOT} media="packshot" color="white" />
    </div>
  ),
};

/** Figma `Card.Category.Square.Small`: dense category grids and mobile quick-access sections. */
export const SquareSmall: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-8 tablet:grid-cols-4 desktop:grid-cols-6">
      <CardCategorySquareSmall {...BASE} title="Best sellers" />
      <CardCategorySquareSmall {...BASE} title="Best sellers" color="white" />
      <CardCategorySquareSmall {...BASE} title="New in" image={undefined} />
    </div>
  ),
};
