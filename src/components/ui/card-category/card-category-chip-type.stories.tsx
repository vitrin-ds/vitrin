import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CardCategoryChipType } from "./card-category-chip-type";

/** Figma's state and text properties. Storybook only. */
type Args = {
  selected: boolean;
  titleText: string;
};

const SQUARE = {
  src: "/dev/sample-square.webp",
  alt: "Serums arranged on a stone tray",
  width: 1024,
  height: 1024,
};
const noop = () => undefined;

function ChipStrip() {
  const [selected, setSelected] = useState("serums");
  const items = [
    { id: "serums", title: "Serums" },
    { id: "creams", title: "Creams" },
    { id: "masks", title: "Masks" },
  ];
  return (
    <div className="flex flex-col gap-16">
      <ul className="flex gap-8 overflow-x-auto p-4">
        {items.map((item) => (
          <li key={item.id}>
            <CardCategoryChipType
              title={item.title}
              image={SQUARE}
              selected={selected === item.id}
              onClick={() => setSelected(item.id)}
            />
          </li>
        ))}
      </ul>
      <nav aria-label="Categories">
        <ul className="flex gap-8 overflow-x-auto p-4">
          <li>
            <CardCategoryChipType title="Best sellers" href="/c/best-sellers" image={SQUARE} />
          </li>
          <li>
            <CardCategoryChipType
              title="Serums"
              href="/c/skincare/serums"
              image={SQUARE}
              selected
            />
          </li>
          <li>
            <CardCategoryChipType title="New in" href="/c/new" />
          </li>
        </ul>
      </nav>
    </div>
  );
}

const meta = {
  title: "Patterns/Discovery/Category Cards/Category Card Chip Type",
  // The defaults of Figma's `Card.Category.ChipType` (State=Default) and `.Base.Card.Category.ChipType`.
  args: { selected: false, titleText: "Best Sellers" },
  render: ({ selected, titleText }) => (
    <CardCategoryChipType title={titleText} image={SQUARE} selected={selected} onClick={noop} />
  ),
  parameters: {
    // The Figma properties of Card.Category.ChipType: State=Selected and Title Text. Hover & Tap is a
    // CSS state.
    controls: { include: ["selected", "titleText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        'Use in horizontal scrollable strips for quick category filtering (e.g., "Best Sellers", "New In", "On Sale")',
        "Use the Selected state to indicate the currently active category filter",
        "Keep Title Text short — one or two words work best in the chip format",
        "Use as a lightweight alternative to full category cards when space is limited",
      ],
      dont: [
        "Don't use for deep category hierarchies — chips work best for top-level or curated selections",
        "Don't mix with other category card types in the same row — keep the strip visually uniform",
        "Don't use overly long labels — they break the compact chip proportions",
        "Don't use without an image — the visual element differentiates this from a standard Chip component",
      ],
    },
    docs: {
      description: {
        component:
          "A chip-style category card combining a small image with a text label — ideal for horizontally scrollable category filters, tag-based navigation, and compact category selection strips. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    selected: {
      description: "Figma `State=Selected` (the current page or the active filter).",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
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

/** Figma `Card.Category.ChipType`: horizontal strips for quick category filtering; Selected marks the active one. */
export const ChipType: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ChipStrip />,
};
