import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardContentDetailed } from "./card-content-detailed";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showCategory: boolean;
  categoryText: string;
  titleText: string;
  showExcerpt: boolean;
  excerptText: string;
  showMeta: boolean;
  metaText: string;
};

const IMAGE = {
  src: "/dev/sample-wide.webp",
  alt: "Two serum bottles side by side",
  width: 1600,
  height: 900,
};

const toProps = ({
  showCategory,
  categoryText,
  titleText,
  showExcerpt,
  excerptText,
  showMeta,
  metaText,
}: Args) => ({
  title: titleText,
  href: "/journal/skincare/vitamin-c-vs-niacinamide",
  image: IMAGE,
  category: showCategory ? categoryText : undefined,
  excerpt: showExcerpt ? excerptText : undefined,
  meta: showMeta ? metaText : undefined,
});

const meta = {
  title: "Patterns/Discovery/Content Cards/Content Card Detailed",
  // The defaults of Figma's `.Base.Card.Content.Detailed`.
  args: {
    showCategory: true,
    categoryText: "Skincare",
    titleText: "Vitamin C vs. niacinamide: which serum is right for you?",
    showExcerpt: true,
    excerptText:
      "Both brighten and protect, but they work differently. Here's how to pick, and whether you can use them together.",
    showMeta: true,
    metaText: "12 Oct 2026 · 6 min read",
  },
  render: (args) => <CardContentDetailed {...toProps(args)} />,
  parameters: {
    // The Figma properties: Show Category, Category Text, Title Text, Show Excerpt, Excerpt Text,
    // Show Meta, Meta Text. State (Default, Hover & Tap) is a CSS state.
    controls: {
      include: [
        "showCategory",
        "categoryText",
        "titleText",
        "showExcerpt",
        "excerptText",
        "showMeta",
        "metaText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for journal listings, category pages and related-article rails",
        "Keep the category visible so readers can scan topics",
        "Show meta (date · reading time) to signal freshness and effort",
        "Use 4-column width on desktop (448px), 3 per row",
      ],
      dont: [
        "Don't use for products — use Card.Product.* instead",
        "Don't hide the title — it is the card's accessible name and link text",
        "Don't write excerpts longer than two sentences",
        "Don't mix Card.Content.Detailed and Card.Content.Compact in the same grid",
      ],
    },
    docs: {
      description: {
        component:
          "A vertical editorial card with image, category, title, excerpt and meta (date · reading time) — designed for blog and journal listings, category pages and related-article rails. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    showCategory: {
      description: "Figma `Show Category`. In code: pass `category`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    categoryText: {
      description: "Figma `Category Text`. In code: `category`.",
      control: "text",
      if: { arg: "showCategory" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Skincare" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Vitamin C vs. niacinamide: which serum is right for you?" },
      },
    },
    showExcerpt: {
      description: "Figma `Show Excerpt`. In code: pass `excerpt`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    excerptText: {
      description: "Figma `Excerpt Text`. In code: `excerpt`.",
      control: "text",
      if: { arg: "showExcerpt" },
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Both brighten and protect, but they work differently…" },
      },
    },
    showMeta: {
      description: "Figma `Show Meta`. In code: pass `meta`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    metaText: {
      description: "Figma `Meta Text`. In code: `meta`.",
      control: "text",
      if: { arg: "showMeta" },
      table: { type: { summary: "string" }, defaultValue: { summary: "12 Oct 2026 · 6 min read" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Journal listings and related-article rails: all slots. Hover turns the title accent and underlines it. */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-448">
        <Story />
      </div>
    ),
  ],
};

/** Three per row on desktop (4 columns each), the last two with Show Excerpt, Show Category and Show Meta off. */
export const Grid: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="grid gap-8 tablet:grid-cols-2 desktop:grid-cols-3">
      <CardContentDetailed {...toProps(args)} />
      <CardContentDetailed {...toProps({ ...args, showExcerpt: false })} />
      <CardContentDetailed {...toProps({ ...args, showCategory: false, showMeta: false })} />
    </div>
  ),
};
