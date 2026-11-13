import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardFeatureAuthor } from "./card-feature-author";

/** Figma's `Show` booleans and text properties. Storybook only: in code a slot shows when it is given. */
type Args = {
  overlineText: string;
  nameText: string;
  bioText: string;
  showButton: boolean;
  /** Not a Figma property: the avatar photo. */
  photo?: string;
};

const meta = {
  title: "Patterns/Discovery/Tactical Feature Cards/Feature Card Author",
  // The defaults of Figma's `Card.Feature.Author`.
  args: {
    overlineText: "About the author",
    nameText: "Maya Chen, Senior Beauty Editor",
    bioText:
      "Maya has written about skincare for over ten years and holds a diploma in cosmetic science.",
    showButton: true,
  },
  render: ({ overlineText, nameText, bioText, showButton, photo }) => (
    <CardFeatureAuthor
      name={nameText}
      photo={photo}
      labels={{ overline: overlineText }}
      link={
        showButton ? { label: "More from Maya", href: "/journal/authors/maya-chen" } : undefined
      }
    >
      {bioText}
    </CardFeatureAuthor>
  ),
  parameters: {
    // Single-Layer: the Figma properties are on the component: Overline Text, Name Text, Bio Text, Show Button.
    controls: { include: ["overlineText", "nameText", "bioText", "showButton"] },
    figma: {
      architecture:
        "Single-Layer component: no base layer, properties are on the component itself.",
      do: [
        "Mention relevant credentials",
        "Keep the bio to 2–3 sentences",
        "Link to the author's page",
        "Use a real photo when available (Avatar Photo)",
      ],
      dont: [
        "Don't use marketing copy",
        "Don't repeat the byline information only",
        "Don't place it above the article",
        "Don't show it on non-editorial pages",
      ],
    },
    docs: {
      description: {
        component:
          "A short author bio at the end of an article with a link to more articles by the same author.",
      },
    },
  },
  argTypes: {
    overlineText: {
      description: "Figma `Overline Text`. In code: `labels.overline`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "About the author" } },
    },
    nameText: {
      description: "Figma `Name Text`: name and role. In code: `name`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Maya Chen, Senior Beauty Editor" },
      },
    },
    bioText: {
      description:
        "Figma `Bio Text`: a two or three sentence bio with credentials. In code: `children`.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    showButton: {
      description:
        "Figma `Show Button`. In code: pass `link` ({ label, href }) to the author page.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-790">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** At the end of an article, with initials and the author link. */
export const Default: Story = {};

/** With a photo and without the link (Figma `Show Button` off). */
export const PhotoNoLink: Story = {
  args: { photo: "/dev/sample-square.webp", showButton: false },
};

/** Mobile width. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-343">
        <Story />
      </div>
    ),
  ],
};
