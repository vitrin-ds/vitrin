import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Rating } from "./rating";

const meta = {
  title: "Components/Inputs/Rating",
  component: Rating,
  // The defaults of Figma's `Rating`: Rating Text "4,9".
  args: { value: 4.9 },
  parameters: {
    // The Figma properties: Rating Text. Usage (Full, Simple) has no control: both draw the same.
    controls: { include: ["value"] },
    figma: {
      do: [
        "Use for displaying product/service ratings and reviews",
        "Show numeric value alongside stars for precision (Full variant)",
        "Use Simple variant for compact spaces like list items",
        "Ensure half-star or partial ratings are visually clear",
      ],
      dont: [
        "Don't use for user input — use an interactive Rating Input instead",
        "Don't hide stars to show lower ratings — show empty/outline stars",
        "Don't use more than 5 stars",
        "Don't mix Full and Simple variants in the same context",
      ],
    },
    docs: {
      description: {
        component:
          "A visual feedback component that displays a star-based rating scale, commonly used for product reviews and user satisfaction scores.",
      },
    },
  },
  argTypes: {
    value: {
      description: "Figma `Rating Text`: the numeric rating, 0 to 5.",
      control: { type: "number", min: 0, max: 5, step: 0.1 },
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "4.9" },
      },
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A product rating: stars with the value beside them (Figma Full and Simple look the same). */
export const Default: Story = {};

/**
 * Whole, half and empty stars; with `display="full"` (default) the value is shown. Stars round down to the nearest half:
 * 4.4 shows 4 stars, 4.6 shows 4½, while the text keeps the real value.
 */
export const Values: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-16">
      <Rating value={5} />
      <Rating value={4.6} />
      <Rating value={4.5} />
      <Rating value={4.4} />
      <Rating value={3.5} />
      <Rating value={1.3} />
      <Rating value={0} />
      <Rating value={4.2} size="sm" />
    </div>
  ),
};

/**
 * `display="stars"`: touching 16px stars, 80 wide (Card.Product.Vertical `Stars`). The value is
 * read out but not shown; the card shows the review count next to it.
 */
/** Code-only `display="stars"`: compact stars for list items and cards. Figma Simple is not this. */
export const StarsOnly: Story = {
  args: { value: 3.5, size: "sm", display: "stars" },
};

/** `display="compact"`: touching stars and the value in brackets (PDP Reviews Scores). */
export const Compact: Story = {
  args: { value: 4, size: "sm", display: "compact" },
};

function Picker() {
  const [value, setValue] = useState(4);
  return (
    <Rating
      interactive
      label="Overall rating"
      name="story-rating"
      value={value}
      onChange={setValue}
      required
    />
  );
}

/** `interactive`: the star picker of Write a Review, a radio group 1 to 5. */
export const Interactive: Story = { render: () => <Picker /> };
