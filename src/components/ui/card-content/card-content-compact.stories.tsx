import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardContentCompact } from "./card-content-compact";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  showDateTime: boolean;
  dateTimeText: string;
  titleText: string;
};

const meta = {
  title: "Patterns/Discovery/Content Cards/Content Card Compact",
  // The defaults of Figma's `.Base.Card.Content.Compact`.
  args: {
    showDateTime: true,
    dateTimeText: "12 Oct 2026",
    titleText:
      "Thoughtful essentials designed to bring ease, comfort, and confidence into your daily routine.",
  },
  render: ({ showDateTime, dateTimeText, titleText }) => (
    <CardContentCompact
      title={titleText}
      href="/journal/rituals/thoughtful-essentials"
      image={{
        src: "/dev/sample-wide.webp",
        alt: "Skincare bottles on a bathroom shelf",
        width: 1600,
        height: 900,
      }}
      dateTime={showDateTime ? dateTimeText : undefined}
      dateTimeISO={showDateTime ? "2026-10-12" : undefined}
    />
  ),
  parameters: {
    // The Figma properties: Show Date Time, Date Time Text, Title Text. State is a CSS state.
    // `Show Title` is not a control: the title is the link text, so the code always shows it.
    controls: { include: ["showDateTime", "dateTimeText", "titleText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for blog feeds, news listings, and editorial content sections",
        "Show Date Time to establish content freshness and recency",
        "Keep Title Text to 2 lines maximum — truncate longer headlines",
        "Use in vertical stacked lists where horizontal layout maximizes content density",
      ],
      dont: [
        "Don't use for product or category cards — this is strictly for editorial/content items",
        "Don't hide both Date Time and Title — at least the title should always be visible",
        "Don't use overly long titles without truncation — horizontal cards have limited text width",
        "Don't mix with product cards in the same list — maintain content type consistency",
      ],
    },
    docs: {
      description: {
        component:
          "A horizontal content card with an image, date/time metadata, and a title — designed for blog posts, news articles, editorial listings, and content-driven feeds. Hover and Tap are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    showDateTime: {
      description: "Figma `Show Date Time`. In code: pass `dateTime`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    dateTimeText: {
      description: "Figma `Date Time Text`. In code: `dateTime`.",
      control: "text",
      if: { arg: "showDateTime" },
      table: { type: { summary: "string" }, defaultValue: { summary: "12 Oct 2026" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "Thoughtful essentials designed to bring ease, comfort, and confidence into your daily routine.",
        },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-448">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Blog feeds and news listings: date and title (two lines at most). Hover underlines it. */
export const Default: Story = {};

/** Without the date: Figma `Show Date Time` off. */
export const TitleOnly: Story = { args: { showDateTime: false } };

/** A long title is clamped to two lines. */
export const LongTitle: Story = {
  args: {
    titleText:
      "Thoughtful essentials designed to bring ease, comfort, and confidence into your daily routine, from the first light of morning to the last quiet minute of the evening.",
  },
};
