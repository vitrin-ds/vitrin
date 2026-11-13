import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heading, Text, type TextTone, type TextVariant } from "./text";

const ALL_VARIANTS: TextVariant[] = [
  "display-lg",
  "display-md",
  "display-sm",
  "headline-lg",
  "headline-md",
  "headline-sm",
  "title-lg",
  "title-md",
  "title-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-sm",
  "label-xs",
  "code-lg",
  "code-md",
  "code-sm",
];

const meta = {
  title: "Foundations/Typography/Text",
  component: Text,
  args: { children: "Glow serum, 30 ml · €24.90", variant: "body-md", tone: "primary" },
  parameters: {
    // The Figma properties: the text styles (Display, Headline, Title, Body, Label, Code).
    // Colour comes from the text/* tokens, not from a Figma property of the style.
    controls: { include: ["variant"] },
    docs: {
      description: {
        component:
          "Typography is a crucial design element that defines a brand's visual identity and ensures the clarity of its messages.",
      },
    },
  },
  argTypes: {
    variant: {
      description:
        "Figma text style: Display, Headline, Title, Body, Label (Large · Medium · Small) and Code. Size follows the Desktop / Tablet / Mobile mode.",
      control: "select",
      options: ALL_VARIANTS,
      table: {
        type: { summary: "TextVariant" },
        defaultValue: { summary: "body-md" },
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One line of text in the chosen style. */
export const Default: Story = {};

const VARIANTS: TextVariant[] = [
  "display-lg",
  "display-md",
  "display-sm",
  "headline-lg",
  "headline-md",
  "headline-sm",
  "title-lg",
  "title-md",
  "title-sm",
  "body-lg",
  "body-md",
  "body-sm",
  "label-lg",
  "label-md",
  "label-sm",
  "code-lg",
  "code-md",
  "code-sm",
];

/** Every Figma text style. label-xs (8px) is decorative only, so it is not shown as copy. */
export const Styles: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <Text variant="code-sm" tone="secondary">
            {variant}
          </Text>
          <Text variant={variant}>We are such stuff as dreams are made on</Text>
        </div>
      ))}
    </div>
  ),
};

const TONES: TextTone[] = [
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "assistive",
  "success",
  "warning",
  "error",
  "info",
];

/** The text/* colour tokens; inverse sits on an inverse surface. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      {TONES.map((tone) => (
        <Text key={tone} tone={tone}>
          {tone}: Free delivery over €50
        </Text>
      ))}
      <Text tone="inverse" className="w-fit rounded-4 bg-surface-inverse px-8">
        inverse: on an inverse surface
      </Text>
    </div>
  ),
};

/** `Heading` takes the level from the document outline, not from the size. */
export const Headings: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <Heading level={1} variant="display-sm">
        h1 · display-sm
      </Heading>
      <Heading level={2}>h2 · headline-md (default)</Heading>
      <Heading level={3} variant="title-lg">
        h3 · title-lg
      </Heading>
    </div>
  ),
};

/** `numeric` keeps prices aligned; `truncate` cuts a long name to one line. */
export const PriceAndTruncate: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-160 flex-col gap-8">
      <Text variant="title-sm" numeric>
        €1,129.00
      </Text>
      <Text variant="title-sm" numeric>
        € 911.10
      </Text>
      <Text truncate>A long product name that does not fit on one line</Text>
    </div>
  ),
};
