import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardProductMinimal } from "./card-product-minimal";

/** Figma's properties. Storybook only: `priceText` is `price.amount` in code. */
type Args = {
  name: string;
  priceText: number;
  description: string;
};

const IMAGE = {
  src: "/dev/sample-square.webp",
  alt: "Rose Body Cream jar",
  width: 1024,
  height: 1024,
};

const meta = {
  title: "Patterns/Discovery/Product Cards/Product Card Minimal",
  // The defaults of Figma's `.Base.Card.Product.Minimal`, in the mock currency.
  args: {
    name: "Rose Body Cream",
    priceText: 2800,
    description: "Daily moisture with rose and olive oil",
  },
  render: ({ name, priceText, description }) => (
    <div className="max-w-448">
      <CardProductMinimal
        name={name}
        href="/p/rose-body-cream"
        image={IMAGE}
        price={{ amount: priceText, currency: "EUR" }}
        description={description}
      />
    </div>
  ),
  parameters: {
    // The Figma properties of Card.Product.Minimal. State (Default, Hover) is a CSS state.
    controls: { include: ["name", "priceText", "description"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for catalogues of a handful of products",
        "Keep the description to one short line",
        "Use the same tinted background for every packshot on a page",
        "Stack one card per row on mobile",
      ],
      dont: [
        "Don't add ratings, likes or badges; use Card.Product.Vertical instead",
        "Don't put two cards side by side on mobile",
        "Don't crop the packshot; keep the 4:5 ratio",
        "Don't use it for large, filterable listings",
      ],
    },
    docs: {
      description: {
        component:
          "Minimal product card for small, single-brand catalogues: a tinted 4:5 packshot, name and price on one row and a one-line description. No rating, likes or badges.",
      },
    },
  },
  argTypes: {
    name: {
      description: "Figma `Name`. In code: `name`. Product name (title-small).",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Rose Body Cream" } },
    },
    priceText: {
      description:
        "Figma `Price`. In code: `price.amount`, in euro cents. Price with currency (label-large).",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "2800" } },
    },
    description: {
      description:
        "Figma `Description`. In code: `description`. One-line description (body-small, text-tertiary).",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Daily moisture with rose and olive oil" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. Hover underlines the name: use the pointer on the example. */
export const Default: Story = {};
