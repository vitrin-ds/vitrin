import { usePasswordToggle } from "./use-password-toggle";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../button/button";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Label } from "../label/label";
import { TextInput } from "./text-input";

const SIZES = ["lg", "md", "sm"] as const;

/** Figma's `Show` booleans. Storybook only: in code a part shows when it is given. */
type Args = {
  size: (typeof SIZES)[number];
  disabled: boolean;
  errorText: string;
  modified: boolean;
  showTitle: boolean;
  titleText: string;
  showRequired: boolean;
  showLabel: boolean;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showPlaceholder: boolean;
  placeholderText: string;
  showInputValue: boolean;
  inputValueText: string;
  showRightIcon: boolean;
  rightIcon: IconName;
  showAction: boolean;
  showHelpMessage: boolean;
  helpMessageText: string;
};

/** Every optional part off, for the stories that show one part at a time. */
const PLAIN = {
  showRequired: false,
  showLabel: false,
  showLeftIcon: false,
  showPlaceholder: false,
  showInputValue: false,
  showRightIcon: false,
  showAction: false,
  showHelpMessage: false,
} as const;

const meta = {
  title: "Components/Inputs/Text Input",
  // The defaults of Figma's `Text Input` and its `.Base Text Input`.
  args: {
    size: "lg",
    disabled: false,
    errorText: "",
    modified: false,
    showTitle: true,
    titleText: "Label",
    showRequired: true,
    showLabel: true,
    showLeftIcon: true,
    leftIcon: "search",
    showPlaceholder: true,
    placeholderText: "Placeholder",
    showInputValue: true,
    inputValueText: "Value",
    showRightIcon: true,
    rightIcon: "visibility",
    showAction: false,
    showHelpMessage: true,
    helpMessageText: "Message",
  },
  // The value is internal state; the key restarts it when the control changes.
  render: ({
    showTitle,
    titleText,
    showRequired,
    showLabel,
    showLeftIcon,
    leftIcon,
    showPlaceholder,
    placeholderText,
    showInputValue,
    inputValueText,
    showRightIcon,
    rightIcon,
    showAction,
    showHelpMessage,
    helpMessageText,
    errorText,
    ...args
  }) => (
    <TextInput
      key={showInputValue ? inputValueText : "empty"}
      {...args}
      label={titleText}
      hideLabel={!showTitle}
      required={showRequired}
      labelDetail={
        showLabel ? (
          <Label color="success" icon="circle">
            VERIFIED
          </Label>
        ) : undefined
      }
      leftIcon={showLeftIcon ? leftIcon : undefined}
      placeholder={showPlaceholder ? placeholderText : undefined}
      defaultValue={showInputValue ? inputValueText : undefined}
      rightIcon={showRightIcon ? rightIcon : undefined}
      action={
        showAction ? (
          <Button size="sm" variant="outline">
            Apply
          </Button>
        ) : undefined
      }
      helperText={showHelpMessage ? helpMessageText : undefined}
      errorText={errorText || undefined}
    />
  ),
  parameters: {
    // The Figma properties: Size, State (Disabled, Error, Modified) and the .Base Text Input slots.
    controls: {
      include: [
        "size",
        "disabled",
        "errorText",
        "modified",
        "showTitle",
        "titleText",
        "showRequired",
        "showLabel",
        "showLeftIcon",
        "leftIcon",
        "showPlaceholder",
        "placeholderText",
        "showInputValue",
        "inputValueText",
        "showRightIcon",
        "rightIcon",
        "showAction",
        "showHelpMessage",
        "helpMessageText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Always include a visible label for accessibility",
        'Use placeholder text to show expected format (e.g., "email@example.com")',
        "Provide clear, actionable error messages",
        "Use right icon for actions like show/hide password or clear input",
      ],
      dont: [
        "Don't use placeholder as a replacement for label",
        "Don't show error state without a helpful message",
        "Don't disable inputs without explaining why",
        "Don't use for multi-line content — use Textarea instead",
      ],
    },
    docs: {
      description: {
        component:
          "A fundamental form element for capturing single-line user input with support for labels, placeholders, validation states, and helper messages. Hover and Focus are CSS states: use the pointer and the keyboard on the example to see them.",
      },
    },
  },
  argTypes: {
    size: {
      description: "Figma `Size`. Forms use Medium.",
      control: "inline-radio",
      options: SIZES,
      table: {
        type: { summary: '"lg" | "md" | "sm"' },
        defaultValue: { summary: "lg" },
      },
    },
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
    modified: {
      description: "Figma `State=Modified`: a value changed but not saved yet.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    showTitle: {
      description:
        "Figma `Show Title`. Off: the label stays for screen readers only. In code: `hideLabel`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `label`.",
      control: "text",
      if: { arg: "showTitle" },
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Label" } },
    },
    showRequired: {
      description: "Figma `Show Required`: the asterisk after the label. In code: `required`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLabel: {
      description:
        "Figma `Show Label`: the Label at the top right, here VERIFIED. In code: pass `labelDetail`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `leftIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    leftIcon: {
      description: "Figma `Left Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showLeftIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "search" } },
    },
    showPlaceholder: {
      description: "Figma `Show Placeholder`. In code: pass `placeholder`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    placeholderText: {
      description: "Figma `Placeholder Text`: shows the expected format. In code: `placeholder`.",
      control: "text",
      if: { arg: "showPlaceholder" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Placeholder" } },
    },
    showInputValue: {
      description: "Figma `Show Input Value`. In code: pass `defaultValue`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    inputValueText: {
      description: "Figma `Input Value Text`. In code: `defaultValue`.",
      control: "text",
      if: { arg: "showInputValue" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Value" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: pass `rightIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description:
        "Figma `Right Icon`: a Material Symbols name. For an interactive control use `action`.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "visibility" } },
    },
    showAction: {
      description:
        "Figma `Show Action`: a button inside the box, here Apply. In code: pass `action`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
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
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

// One field at the 3-column aside width (334px).
const narrow: Story["decorators"] = [
  (Story) => (
    <div className="w-334">
      <Story />
    </div>
  ),
];

/** A single-line field with a visible label and a placeholder showing the format. */
export const Default: Story = {
  decorators: narrow,
  args: {
    ...PLAIN,
    titleText: "Email",
    showRequired: true,
    showPlaceholder: true,
    placeholderText: "email@example.com",
  },
};

/** Mirrors the Figma set: Default · Has Value · Error · Disabled · Modified per size (Hover / Focus are CSS states). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 gap-24 desktop:grid-cols-3">
      {SIZES.map((size) => (
        <div key={size} className="flex w-270 flex-col gap-16">
          <TextInput size={size} label="Label" placeholder="Placeholder" required />
          <TextInput size={size} label="Label" defaultValue="Value" required />
          <TextInput size={size} label="Label" defaultValue="Value" required errorText="Message" />
          <TextInput size={size} label="Label" defaultValue="Value" required disabled />
          <TextInput size={size} label="Label" defaultValue="Value" required modified />
        </div>
      ))}
    </div>
  ),
};

/** A left icon and a help message under the field. */
export const WithHelperAndIcons: Story = {
  decorators: narrow,
  args: {
    ...PLAIN,
    titleText: "Search the shop",
    showPlaceholder: true,
    placeholderText: "Serums, cleansers…",
    showLeftIcon: true,
    showHelpMessage: true,
    helpMessageText: "Search by product or ingredient.",
  },
};

/** Figma `State=Error`: always with a message that says how to fix it. */
export const WithError: Story = {
  decorators: narrow,
  args: {
    ...PLAIN,
    titleText: "Email",
    showRequired: true,
    showInputValue: true,
    inputValueText: "anna@",
    errorText: "Enter an email like name@example.com",
  },
};

/** Figma `State=Focus`: the box takes the focus border and shadow. */
export const Focus: Story = {
  decorators: narrow,
  args: {
    ...PLAIN,
    titleText: "Email",
    showPlaceholder: true,
    placeholderText: "email@example.com",
  },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const input = within(canvasElement).getByRole("textbox", { name: "Email" });
    await expect(input).toHaveFocus();
    const box = getComputedStyle(input.parentElement!);
    await expect(box.outlineStyle).toBe("none");
    await expect(getComputedStyle(input).outlineStyle).toBe("none");
    await expect(box.boxShadow).toContain("0px 1px 6px 0px");
  },
};

/**
 * Trailing `action` inside the box (Coupon "Apply"). The box keeps its focus border while either
 * has focus; the button is a control of its own.
 */
export const WithAction: Story = {
  decorators: narrow,
  args: { ...PLAIN, titleText: "Discount or promo code", showAction: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Discount or promo code" });
    const box = input.parentElement!;
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(box).outlineStyle).toBe("none");
    await expect(getComputedStyle(box).boxShadow).toContain("0px 1px 6px 0px");
    await userEvent.tab();
    const button = canvas.getByRole("button", { name: "Apply" });
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(box).boxShadow).toContain("0px 1px 6px 0px");
  },
};

/** With an error the action stays centred in the box; the message sits under it. */
export const WithActionAndError: Story = {
  decorators: narrow,
  args: {
    ...PLAIN,
    titleText: "Discount or promo code",
    showInputValue: true,
    inputValueText: "SUMMER10",
    errorText: "This code has expired.",
    showAction: true,
  },
};

/** Beside the label: VERIFIED, or MODIFIED on a changed field (Figma 03.05 Edit Account). */
export const WithLabelDetail: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-448 flex-col gap-24">
      <TextInput
        label="E-Mail"
        defaultValue="ada@example.com"
        labelDetail={
          <Label color="success" icon="circle">
            VERIFIED
          </Label>
        }
      />
      <TextInput
        label="Phone Number"
        defaultValue="7700900245"
        modified
        labelDetail={
          <Label color="warning" icon="circle">
            MODIFIED
          </Label>
        }
      />
    </div>
  ),
};

/** Figma `Show Title=false`: the label stays for screen readers only. A field whose purpose is clear from context, such as a search box. */
export const HiddenLabel: Story = {
  decorators: narrow,
  args: {
    ...PLAIN,
    showTitle: false,
    titleText: "Search orders",
    showPlaceholder: true,
    placeholderText: "Search orders",
  },
};

function PasswordExample() {
  const toggle = usePasswordToggle("story-password");
  return (
    <div className="max-w-334">
      <TextInput
        label="Password"
        autoComplete="new-password"
        defaultValue="secret-value"
        {...toggle}
      />
    </div>
  );
}

/** A password field: `usePasswordToggle` masks the value and the Right Icon shows or hides it. */
export const Password: Story = { render: () => <PasswordExample /> };

/** A verification code: Show Title off, one field for the six digits. */
export const VerificationCode: Story = {
  render: () => (
    <div className="max-w-334">
      <TextInput
        label="Verification code"
        hideLabel
        placeholder="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
      />
    </div>
  ),
};
