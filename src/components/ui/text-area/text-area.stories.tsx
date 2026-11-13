import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextArea } from "./text-area";

/** Figma's `Show` booleans. Storybook only: in code a part shows when it is given. */
type Args = {
  disabled: boolean;
  errorText: string;
  titleText: string;
  showRequired: boolean;
  showRightDetail: boolean;
  rightDetailText: string;
  showPlaceholder: boolean;
  placeholderText: string;
  showValue: boolean;
  valueText: string;
  showHelpMessage: boolean;
  helpMessageText: string;
};

const meta = {
  title: "Components/Inputs/Text Area",
  // The defaults of Figma's `.Base Textarea`.
  args: {
    disabled: false,
    errorText: "",
    titleText: "Label",
    showRequired: true,
    showRightDetail: true,
    rightDetailText: "Label",
    showPlaceholder: true,
    placeholderText: "Placeholder",
    showValue: true,
    valueText: "Value",
    showHelpMessage: true,
    helpMessageText: "Message",
  },
  // The value is internal state; the key restarts it when the control changes.
  render: ({
    titleText,
    showRequired,
    showRightDetail,
    rightDetailText,
    showPlaceholder,
    placeholderText,
    showValue,
    valueText,
    showHelpMessage,
    helpMessageText,
    errorText,
    ...args
  }) => (
    <TextArea
      key={showValue ? valueText : "empty"}
      {...args}
      label={titleText}
      required={showRequired}
      labelDetail={showRightDetail ? rightDetailText : undefined}
      placeholder={showPlaceholder ? placeholderText : undefined}
      defaultValue={showValue ? valueText : undefined}
      helperText={showHelpMessage ? helpMessageText : undefined}
      errorText={errorText || undefined}
    />
  ),
  parameters: {
    // The Figma properties: State (Error, Disabled) and the .Base Textarea slots.
    controls: {
      include: [
        "disabled",
        "errorText",
        "titleText",
        "showRequired",
        "showRightDetail",
        "rightDetailText",
        "showPlaceholder",
        "placeholderText",
        "showValue",
        "valueText",
        "showHelpMessage",
        "helpMessageText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for multi-line content like comments, descriptions, or feedback",
        "Show character count when there's a maximum limit",
        "Provide adequate default height for expected content length",
        "Enable resize handle for user flexibility",
      ],
      dont: [
        "Don't use for single-line inputs — use Text Input instead",
        "Don't set minimum height too small for the expected content",
        "Don't hide the resize handle unless space is critically limited",
        "Don't show error state without a helpful message",
      ],
    },
    docs: {
      description: {
        component:
          "A multi-line text input for capturing longer user content such as comments, descriptions, or messages with resizable and scrollable capabilities. Hover is a CSS state: use the pointer on the example to see it.",
      },
    },
  },
  argTypes: {
    disabled: {
      description: "Figma `State=Disabled`.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    errorText: {
      description:
        "Figma `State=Error`: the message under the field, in place of the help message. Never show an error without one. Empty: no error.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `label`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Label" } },
    },
    showRequired: {
      description: "Figma `Show Required`: the asterisk after the label. In code: `required`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showRightDetail: {
      description: "Figma `Show Right Detail`. In code: pass `labelDetail`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightDetailText: {
      description: 'Figma `Right Detail Text`, e.g. "(optional)". In code: `labelDetail`.',
      control: "text",
      if: { arg: "showRightDetail" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Label" } },
    },
    showPlaceholder: {
      description: "Figma `Show Placeholder`. In code: pass `placeholder`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    placeholderText: {
      description: "Figma `Placeholder Text`. In code: `placeholder`.",
      control: "text",
      if: { arg: "showPlaceholder" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Placeholder" } },
    },
    showValue: {
      description: "Figma `Show Value`. In code: pass `defaultValue`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    valueText: {
      description: "Figma `Value Text`. In code: `defaultValue`.",
      control: "text",
      if: { arg: "showValue" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Value" } },
    },
    showHelpMessage: {
      description: "Figma `Show Help Message`. In code: pass `helperText`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    helpMessageText: {
      description: "Figma `Help Message Text`. In code: `helperText`.",
      control: "text",
      if: { arg: "showHelpMessage" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Message" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-334">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A multi-line field for comments, with a visible label. */
export const Default: Story = {
  args: {
    titleText: "Review",
    showRightDetail: false,
    showValue: false,
    showHelpMessage: false,
    placeholderText: "What did you like or dislike?",
  },
};

/** Mirrors the Figma set: Default · Has Value · Error · Disabled (Hover / Filled are CSS states). */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-16">
      <TextArea label="Label" placeholder="Placeholder" required />
      <TextArea label="Label" defaultValue="Value" required />
      <TextArea label="Label" defaultValue="Value" required errorText="Message" />
      <TextArea label="Label" defaultValue="Value" required disabled />
    </div>
  ),
};

/** Figma `Right Detail`: a character count when there is a maximum. */
export const WithCounter: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TextArea
      label="Gift message"
      maxLength={200}
      showCount
      defaultValue="Happy birthday!"
      helperText="Printed on the packing slip."
    />
  ),
};

/** Beside the label: "(optional)" on Cancel Order's comments (Figma 03.01.03). */
export const WithLabelDetail: Story = {
  args: {
    titleText: "Add Note",
    rightDetailText: "(optional)",
    showRequired: false,
    showValue: false,
    showHelpMessage: false,
  },
};
