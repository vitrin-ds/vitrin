import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { CardCategoryVerticalFeatured } from "./card-category-vertical-featured";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showOverline: boolean;
  overlineText: string;
  showTitle: boolean;
  titleText: string;
  showCta: boolean;
  c2aText: string;
  icon: IconName;
};

const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
/** Worst case for the scrim: a plain white photo. */
const WHITE = { src: "/dev/sample-white.webp", alt: "White backdrop", width: 1024, height: 1024 };
const BASE = { title: "Serums", href: "/c/skincare/serums", image: SQUARE };

const meta = {
  title: "Patterns/Discovery/Category Cards/Category Card Vertical Featured",
  // The defaults of Figma's `.Base.Card.Category.Vertical.Featured`.
  args: {
    showOverline: true,
    overlineText: "Overline",
    showTitle: true,
    titleText: "Title Text",
    showCta: true,
    c2aText: "C2A Text",
    icon: "arrow_forward",
  },
  render: ({ showOverline, overlineText, showTitle, titleText, showCta, c2aText, icon }) => (
    <div className="max-w-250">
      <CardCategoryVerticalFeatured
        {...BASE}
        title={titleText}
        showTitle={showTitle}
        overline={showOverline ? overlineText : undefined}
        cta={showCta ? c2aText : undefined}
        rightIcon={icon}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Category.Vertical.Featured: Base only. State (Default, Hover &
    // Tap) is a CSS state.
    controls: {
      include: [
        "showOverline",
        "overlineText",
        "showTitle",
        "titleText",
        "showCta",
        "c2aText",
        "icon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for homepage category heroes, seasonal campaign banners, and editorial collection entries",
        'Use Overline for contextual framing like "New Arrivals", "Limited Time", or season labels',
        'Keep C2A Text action-oriented and concise — "Shop Now", "Explore", "View Collection"',
        "Pair with strong, full-bleed imagery that reinforces the category's visual identity",
      ],
      dont: [
        "Don't use in standard category grids — use Card.Category.Horizontal or Card.Category.Circle instead",
        "Don't hide C2A — the card needs a clear navigation affordance",
        "Don't use generic titles — this card is editorial, so the copy should be intentional and curated",
        "Don't overload with long Overline and Title together — keep the hierarchy tight and scannable",
      ],
    },
    docs: {
      description: {
        component:
          "A visually prominent category card with editorial overlay text and a call-to-action link — designed for hero-level category promotion, seasonal campaigns, and curated collection highlights. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    showTitle: {
      description:
        "Figma `Show Title`. In code: `showTitle`; off hides the title on screen but keeps it as the link's accessible name.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showOverline: {
      description: "Figma `Show Overline`. In code: pass `overline`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    overlineText: {
      description: "Figma `Overline Text`. In code: `overline`.",
      control: "text",
      if: { arg: "showOverline" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Overline" } },
    },
    titleText: {
      description:
        "Figma `Title Text`. In code: `title`. `Show Title` is not a control: the title names the link.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Title Text" } },
    },
    showCta: {
      description: "Figma `Show CTA`. In code: pass `cta`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    c2aText: {
      description: "Figma `C2A Text`. In code: `cta`.",
      control: "text",
      if: { arg: "showCta" },
      table: { type: { summary: "string" }, defaultValue: { summary: "C2A Text" } },
    },
    icon: {
      description: "Figma `Icon`: the call-to-action glyph. In code: `rightIcon`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showCta" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "arrow_forward" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** Figma `Card.Category.Vertical.Featured`: homepage category heroes, seasonal campaign banners and editorial collection entries. */
export const VerticalFeatured: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-8 desktop:grid-cols-4">
      <CardCategoryVerticalFeatured
        {...BASE}
        title="The winter edit"
        overline="New season"
        cta="Shop the edit"
        image={undefined}
      />
      <CardCategoryVerticalFeatured {...BASE} title="Body care" cta="Discover" />
      <CardCategoryVerticalFeatured
        {...BASE}
        image={WHITE}
        title="Fragrance for the long winter evenings"
        overline="Contrast check"
        cta="Shop the edit"
      />
    </div>
  ),
};
