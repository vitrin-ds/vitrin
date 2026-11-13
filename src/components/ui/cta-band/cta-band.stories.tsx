import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CtaBand, type CtaBandProps } from "./cta-band";
/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  layout: CtaBandProps["layout"];
  titleText: string;
  bodyText: string;
  showSecondaryAction: boolean;
  primaryAction: CtaBandProps["primaryAction"];
  secondaryAction: CtaBandProps["secondaryAction"];
};

const meta = {
  title: "Patterns/Promotions & Marketing/In Page Banners/CTA Band",
  // The defaults of Figma's `CTABand` and `.Base.CTABand`.
  args: {
    layout: "horizontal",
    titleText: "Come and say hello",
    bodyText:
      "Visit one of our stores for free skin consultations, or join a team that loves what it does.",
    showSecondaryAction: true,
    primaryAction: { label: "Find a store", href: "/stores" },
    secondaryAction: { label: "Careers", href: "/about/careers" },
  },
  render: ({ titleText, bodyText, showSecondaryAction, secondaryAction, ...args }) => (
    <CtaBand
      {...args}
      title={titleText}
      secondaryAction={showSecondaryAction ? secondaryAction : undefined}
    >
      {bodyText}
    </CtaBand>
  ),
  parameters: {
    controls: {
      include: ["layout", "titleText", "bodyText", "showSecondaryAction"],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use one primary action",
        "End content pages with a clear next step",
        "Keep the title under six words",
        "Use Stacked below 1024px",
      ],
      dont: [
        "Don't use more than two buttons",
        "Don't use it for promotions with prices — use Banner",
        "Don't place two CTA bands in a row",
        "Don't use it inside cards",
      ],
    },
    docs: {
      description: {
        component:
          "A tinted call-to-action band: a short title, one sentence and up to two actions. Used at the end of content pages (About, Legal Centre, Help).",
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
      description: "Figma `Title Text`. In code: `title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Come and say hello" } },
    },
    bodyText: {
      description: "Figma `Body Text`. In code: `children`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: {
          summary:
            "Visit one of our stores for free skin consultations, or join a team that loves what it does.",
        },
      },
    },
    showSecondaryAction: {
      description: "Figma `Show Secondary Action`. In code: pass `secondaryAction`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
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

/** One action (Figma `Show Secondary Action=false`) that acts instead of navigating. */
export const SingleAction: Story = {
  args: {
    titleText: "Still need help?",
    bodyText: "Our team answers within one working day.",
    primaryAction: { label: "Contact us", onClick: fn() },
    showSecondaryAction: false,
  },
};

/** Responsive (default): Stacked below 1024px, Horizontal from desktop. */
export const Responsive: Story = { args: { layout: "responsive" } };
