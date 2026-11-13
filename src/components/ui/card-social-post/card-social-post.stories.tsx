import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardSocialPost } from "./card-social-post";

/** Figma's `Card.Social.Post` and `.Base.Card.Social.Post` properties. */
type Args = { type: "post" | "see-more"; handle: string };

const meta = {
  title: "Patterns/Social Proof & Reviews/Social Post",
  // The defaults of Figma's `Card.Social.Post` (Type=Post) and `.Base.Card.Social.Post`.
  args: { type: "post", handle: "@sofia.m" },
  render: (args) => (
    <div className="w-220 bg-surface-accent-strong p-16">
      {args.type === "see-more" ? (
        <CardSocialPost type="see-more" href="#feed" />
      ) : (
        <CardSocialPost handle={args.handle} href="#post" />
      )}
    </div>
  ),
  parameters: {
    controls: { include: ["type", "handle"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use three posts and one See more tile",
        "Place on a dark or gradient band",
        "Credit the creator with their handle",
        "Keep all tiles the same size",
      ],
      dont: [
        "Don't use on light surfaces; the handle uses text-on-accent",
        "Don't mix product packshots into the feed",
        "Don't autoplay or animate the tiles",
        "Don't show more than one row",
      ],
    },
    docs: {
      description: {
        component:
          'UGC / social post tile: avatar dot + handle, 4:5 image. "See more" variant is a dashed tile.',
      },
    },
  },
  argTypes: {
    type: {
      description: "Figma `Type`: Post uses the base layer; See more is the dashed closing tile.",
      control: "inline-radio",
      options: ["post", "see-more"],
      table: { type: { summary: '"post" | "see-more"' }, defaultValue: { summary: "post" } },
    },
    handle: {
      description: "Figma `Handle`: @handle of the creator (label-small, text-on-accent).",
      control: "text",
      if: { arg: "type", eq: "post" },
      table: { type: { summary: "string" }, defaultValue: { summary: "@sofia.m" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Type=Post`. */
export const Default: Story = {};

/** Figma `Type=See more`. */
export const SeeMore: Story = { args: { type: "see-more" } };

/** Figma 20.01 Social band: three posts and one See more tile, one row. */
export const Row: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="grid grid-cols-4 gap-8 bg-surface-accent-strong p-16">
      {["@sofia.m", "@ayse.k", "@lunara"].map((handle) => (
        <li key={handle}>
          <CardSocialPost handle={handle} href="#post" />
        </li>
      ))}
      <li>
        <CardSocialPost type="see-more" href="#feed" />
      </li>
    </ul>
  ),
};
