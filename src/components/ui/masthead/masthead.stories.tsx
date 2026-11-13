import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Masthead, type MastheadProps } from "./masthead";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  titleText: string;
  bodyText: string;
  showCloseButton: boolean;
  image: MastheadProps["image"];
};

const meta = {
  title: "Patterns/Promotions & Marketing/Masthead",
  // The defaults of Figma's `Masthead` (Breakpoint=Desktop).
  args: {
    titleText: "HAPPY 15TH ANNIVERSARY!",
    bodyText:
      "Every year, we grow a little more—thanks to you, and with you. Today, we proudly celebrate the 15th year of this beautiful journey! 🎂 Together, we’ve grown, glowed, and collected countless unforgettable moments. A huge, heartfelt thank you to all of you who’ve been with us for 15 years. We’re so glad you’re here!",
    showCloseButton: true,
    image: { src: "/dev/sample-wide.webp", alt: "", width: 1600, height: 900 },
  },
  render: ({ titleText, bodyText, showCloseButton, image }) => (
    <Masthead title={titleText} image={image} onClose={showCloseButton ? fn() : undefined}>
      {bodyText}
    </Masthead>
  ),
  parameters: {
    layout: "fullscreen",
    controls: {
      include: ["titleText", "bodyText", "showCloseButton"],
    },
    figma: {
      architecture:
        "This component uses a Single-Layer Architecture. It does not have a Base layer; properties are on the component set itself.",
      do: [
        "Use it for rare, brand-level announcements",
        "Let users dismiss it and remember the choice",
        "Keep the body to about three lines",
        "Use a calm background so the header stays the focus",
      ],
      dont: [
        "Don't use it for everyday promotions — use the Promo Bar",
        "Don't show more than one masthead at a time",
        "Don't push the main content below the fold on mobile",
        "Don't put the only CTA of the page in it",
      ],
    },
    docs: {
      description: {
        component:
          "A dismissible announcement band shown above the header for brand moments such as anniversaries or store-wide news. Media on one side, title and body on the other; stacks on tablet and mobile.",
      },
    },
  },
  argTypes: {
    titleText: {
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "HAPPY 15TH ANNIVERSARY!" } },
    },
    bodyText: {
      description: "Figma `Body Text`. In code: `children`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "Every year, we grow a little more\u2014thanks to you, and with you. Today, we proudly celebrate the 15th year of this beautiful journey! \ud83c\udf82 Together, we\u2019ve grown, glowed, and collected countless unforgettable moments. A huge, heartfelt thank you to all of you who\u2019ve been with us for 15 years. We\u2019re so glad you\u2019re here!",
        },
      },
    },
    showCloseButton: {
      description: "Figma `Show Close Button`. In code: pass `onClose`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Breakpoint`: media beside the copy from 1024px, above it below. */
export const Responsive: Story = {};

/** Without the close button (Figma `Show Close Button=false`) and media placeholder. */
export const NotDismissible: Story = { args: { showCloseButton: false, image: undefined } };
