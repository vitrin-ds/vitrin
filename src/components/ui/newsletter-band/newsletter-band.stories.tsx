import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  NEWSLETTER_BAND_LABELS,
  NewsletterBand,
  type NewsletterBandProps,
} from "./newsletter-band";
type Args = {
  layout: NewsletterBandProps["layout"];
  titleText: string;
  bodyText: string;
  onSubmit: NewsletterBandProps["onSubmit"];
};

const meta = {
  title: "Patterns/Promotions & Marketing/Newsletter Signup",
  // The defaults of Figma's `NewsletterBand` and `.Base.NewsletterBand`.
  args: {
    layout: "horizontal",
    titleText: NEWSLETTER_BAND_LABELS.title,
    bodyText: NEWSLETTER_BAND_LABELS.body,
    onSubmit: fn(),
  },
  render: ({ titleText, bodyText, ...args }) => (
    <NewsletterBand
      {...args}
      labels={{ ...NEWSLETTER_BAND_LABELS, title: titleText, body: bodyText }}
    />
  ),
  parameters: {
    controls: {
      include: ["layout", "titleText", "bodyText"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Say what and how often people will receive",
        "Mention they can unsubscribe any time",
        "Use one field (email) only",
        "Show inline success and error states on the input",
      ],
      dont: [
        "Don't pre-tick marketing consent",
        "Don't ask for more than an email",
        "Don't place more than one band per page",
        "Don't use it in checkout",
      ],
    },
    docs: {
      description: {
        component:
          "An email signup band for content and listing pages: a short pitch and an email field with a Subscribe button.",
      },
    },
  },
  argTypes: {
    layout: {
      description:
        "Figma `Layout`. In code there is also `responsive` (Stacked below 1024px, the code default), used by the Responsive story.",
      control: "inline-radio",
      options: ["horizontal", "stacked"],
      table: {
        type: { summary: '"horizontal" | "stacked"' },
        defaultValue: { summary: "horizontal" },
      },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `labels.title`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Get the Journal in your inbox" },
      },
    },
    bodyText: {
      description: "Figma `Body Text`. In code: `labels.body`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "One email a week with new guides, expert tips and early access to offers. Unsubscribe any time.",
        },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `Layout=Horizontal` (desktop). */
export const Horizontal: Story = {
  args: { layout: "horizontal" },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="p-40">
        <Story />
      </div>
    ),
  ],
};

/** Figma `Layout=Stacked` (tablet/mobile). */
export const Stacked: Story = {
  args: { layout: "stacked" },
  decorators: [
    (Story) => (
      <div className="max-w-343">
        <Story />
      </div>
    ),
  ],
};

/** Invalid address: the TextInput error state, then success after a valid one. */
export const Validation: Story = {
  parameters: { controls: { disable: true } },
  args: { layout: "stacked" },
  decorators: Stacked.decorators,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email address" });
    await userEvent.type(input, "not-an-email");
    await userEvent.click(canvas.getByRole("button", { name: "Subscribe" }));
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, "name@example.com{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledWith("name@example.com");
    await expect(canvas.getByRole("status")).toHaveTextContent("Check your inbox");
  },
};

/** Responsive (default): Stacked below 1024px, Horizontal from desktop. */
export const Responsive: Story = { args: { layout: "responsive" } };
