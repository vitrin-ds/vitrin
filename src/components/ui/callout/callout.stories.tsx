import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Callout } from "./callout";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  type: "summary" | "tip" | "quote";
  showTitle: boolean;
  titleText: string;
  bodyText: string;
  showAttribution: boolean;
  attributionText: string;
};

const ITEMS = [
  "Five steps are enough: cleanse, treat, hydrate, protect the barrier, sleep.",
  "Use one active ingredient per night and introduce new ones slowly.",
  "Apply products from thinnest to thickest texture.",
];

const TYPES = ["summary", "tip", "quote"] as const;

// Figma's `Body Text` is one text with "•  " lines; the Summary renders them as a list.
const BULLET = /^•\s+/;

const meta = {
  title: "Components/Data Display/Callout",
  // The defaults of Figma's `.Base.Callout` (Type=Summary).
  args: {
    type: "summary",
    showTitle: true,
    titleText: "Key takeaways",
    bodyText:
      "•  Five steps are enough: cleanse, treat, hydrate, protect the barrier, sleep.\n•  Use one active ingredient per night and introduce new ones slowly.\n•  Apply products from thinnest to thickest texture.",
    showAttribution: false,
    attributionText: "Dr. Lena Ortiz, Consultant Dermatologist",
  },
  render: ({ type, showTitle, titleText, bodyText, showAttribution, attributionText }) => {
    const attribution = showAttribution ? attributionText : undefined;
    if (type === "quote") {
      return (
        <Callout type="quote" attribution={attribution}>
          {bodyText}
        </Callout>
      );
    }
    const title = showTitle ? titleText : undefined;
    if (type === "summary") {
      const items = bodyText.split("\n").map((line) => line.replace(BULLET, ""));
      return <Callout type="summary" title={title} items={items} attribution={attribution} />;
    }
    return (
      <Callout type="tip" title={title} attribution={attribution}>
        {bodyText}
      </Callout>
    );
  },
  parameters: {
    // The Figma properties: Type, Show Title, Title Text, Body Text, Show Attribution,
    // Attribution Text.
    controls: {
      include: ["type", "showTitle", "titleText", "bodyText", "showAttribution", "attributionText"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use one Summary at the top of long articles to answer intent fast",
        "Keep Summary to 3–5 bullet lines",
        "Use Tip for expert advice with a named source",
        "Use Quote sparingly — at most one per article",
      ],
      dont: [
        "Don't stack several callouts directly after each other",
        "Don't use Callout for system messages — use Alert",
        "Don't put links-only content in a Callout",
        "Don't use Quote without an attribution",
      ],
    },
    docs: {
      description: {
        component:
          "A highlight block for long-form content: Summary for key takeaways at the top of an article, Tip for expert advice inside a section, and Quote for pull quotes.",
      },
    },
  },
  argTypes: {
    type: {
      description:
        "Figma `Type`: Summary is tinted with an accent bar, Tip is outlined, Quote is large text with an accent bar.",
      control: "inline-radio",
      options: TYPES,
      table: {
        type: { summary: '"summary" | "tip" | "quote"' },
        defaultValue: { summary: "summary" },
      },
    },
    showTitle: {
      description: "Figma `Show Title`. In code: pass `title`. Quote has no title.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description: "Figma `Title Text`: the heading, e.g. Key takeaways. In code: `title`.",
      control: "text",
      if: { arg: "showTitle" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Key takeaways" } },
    },
    bodyText: {
      description:
        "Figma `Body Text`. Summary: one bullet per line (`items`); Tip: `children`; Quote: the quoted words (`children`).",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    showAttribution: {
      description: "Figma `Show Attribution`. In code: pass `attribution`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    attributionText: {
      description: "Figma `Attribution Text`: the quote author or source. In code: `attribution`.",
      control: "text",
      if: { arg: "showAttribution" },
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "Dr. Lena Ortiz, Consultant Dermatologist" },
      },
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

/** Figma `Type=Summary`: key takeaways at the top of a long article. */
export const Summary: Story = {
  args: {},
};

/** Figma `Type=Tip`: expert advice with a named source. */
export const Tip: Story = {
  args: {
    type: "tip",
    titleText: "Expert tip",
    bodyText:
      "“Start retinol twice a week and build up slowly. Irritation is a sign to slow down, not to stop.” — Dr. Alex Moreno",
  },
};

/** Figma `Type=Quote`: a pull quote with its attribution. */
export const Quote: Story = {
  args: {
    type: "quote",
    bodyText: "A healthy barrier makes every other step work better.",
    showAttribution: true,
    attributionText: "Dr. Alex Moreno, Consultant Dermatologist",
  },
};

/** All three types; the Summary has a heading title (TOC target) and an attribution. */
export const AllTypes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-40">
      <Callout
        type="summary"
        title="Key takeaways"
        items={ITEMS}
        headingLevel={2}
        titleId="key-takeaways"
        attribution="Reviewed by Dr. Alex Moreno"
      />
      <Callout type="tip" title="Expert tip">
        Patch-test every new product on your inner arm for two days.
      </Callout>
      <Callout type="quote" attribution="Dr. Alex Moreno, Consultant Dermatologist">
        A healthy barrier makes every other step work better.
      </Callout>
    </div>
  ),
};
