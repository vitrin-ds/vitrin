import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { Button, ButtonLink, type ButtonProps } from "./button";

/** Figma's `Show` booleans. Storybook only: in code a slot shows when it is given. */
type Args = {
  variant: ButtonProps["variant"];
  size: ButtonProps["size"];
  disabled: boolean;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showButtonText: boolean;
  buttonText: string;
  showRightIcon: boolean;
  rightIcon: IconName;
};

const VARIANTS = ["filled", "outline", "ghost", "filled-error", "outline-error"] as const;
const SIZES = ["lg", "md", "sm"] as const;

const meta = {
  title: "Components/Actions/Button",
  // The defaults of Figma's `.Base Button`.
  args: {
    variant: "filled",
    size: "md",
    disabled: false,
    showLeftIcon: true,
    leftIcon: "add",
    showButtonText: true,
    buttonText: "Button",
    showRightIcon: true,
    rightIcon: "store",
  },
  render: ({
    showLeftIcon,
    leftIcon,
    showButtonText,
    buttonText,
    showRightIcon,
    rightIcon,
    ...args
  }) => {
    const icons = {
      leftIcon: showLeftIcon ? leftIcon : undefined,
      rightIcon: showRightIcon ? rightIcon : undefined,
    };
    return showButtonText ? (
      <Button {...args} {...icons}>
        {buttonText}
      </Button>
    ) : (
      <Button {...args} {...icons} aria-label={buttonText} />
    );
  },
  parameters: {
    // The Figma properties: Style, Size, State Disabled, Button Text, Left Icon, Right Icon.
    controls: {
      include: [
        "variant",
        "size",
        "disabled",
        "showLeftIcon",
        "leftIcon",
        "showButtonText",
        "buttonText",
        "showRightIcon",
        "rightIcon",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Filled for the primary action on a page",
        "Use Outline for secondary actions alongside a primary",
        "Use Ghost for tertiary or inline actions",
        "Maintain consistent sizing within button groups",
        "Use Filled Error or Outline Error only for destructive actions (delete, remove, cancel order)",
      ],
      dont: [
        "Don't use multiple Filled buttons in close proximity",
        "Don't mix sizes in the same button group",
        "Don't use icon-only without accessible label",
        "Don't use the Error styles for validation messages or for non-destructive actions",
      ],
    },
    docs: {
      description: {
        component:
          "A versatile button component for primary actions, form submissions, and navigation triggers. Hover and Active are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    variant: {
      name: "variant",
      description:
        "Figma `Style`: how loud the action is. The error styles are for destructive actions.",
      control: "inline-radio",
      options: VARIANTS,
      table: {
        type: { summary: VARIANTS.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "filled" },
      },
    },
    size: {
      description:
        "Figma `Size`: Large 52 · Medium 44 · Small 36 tall. Small keeps a 44px touch area.",
      control: "inline-radio",
      options: SIZES,
      table: {
        type: { summary: '"lg" | "md" | "sm"' },
        defaultValue: { summary: "md" },
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
      table: { type: { summary: "IconName" }, defaultValue: { summary: "add" } },
    },
    showButtonText: {
      description: "Figma `Show Button Text`. Off: icon-only, and the text becomes `aria-label`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    buttonText: {
      description: "Figma `Button Text`. In code: `children`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Button" } },
    },
    showRightIcon: {
      description: "Figma `Show Right Icon`. In code: pass `rightIcon`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    rightIcon: {
      description: "Figma `Right Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      if: { arg: "showRightIcon" },
      table: { type: { summary: "IconName" }, defaultValue: { summary: "store" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The main action of a view. Use one per view. */
export const Default: Story = {};

/** A secondary action, next to a Filled Button. */
export const Outline: Story = { args: { variant: "outline" } };

/** A tertiary action, inline with other content. No container, no side padding. */
export const Ghost: Story = { args: { variant: "ghost" } };

/** The destructive action of a confirmation: delete, remove. */
export const FilledError: Story = { args: { variant: "filled-error" } };

/** A destructive action that is not the main one on the page: cancel an order. */
export const OutlineError: Story = { args: { variant: "outline-error" } };

/** Every Style × Size, Default and Disabled, with the Figma default icons. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-5 items-center justify-items-start gap-16">
      {SIZES.flatMap((size) =>
        [false, true].flatMap((disabled) =>
          VARIANTS.map((variant) => (
            <Button
              key={`${size}-${variant}-${disabled}`}
              variant={variant}
              size={size}
              disabled={disabled}
              leftIcon="add"
              rightIcon="store"
            >
              Button
            </Button>
          )),
        ),
      )}
    </div>
  ),
};

/** Figma `Show Button Text` off: square, and needs an accessible name. */
export const IconOnly: Story = {
  args: {
    variant: "outline",
    leftIcon: "favorite",
    showRightIcon: false,
    showButtonText: false,
    buttonText: "Add to wishlist",
  },
};

/** ButtonLink: a Figma Button that navigates, with the same Style and Size. */
export const AsLink: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap gap-12">
      <ButtonLink href="#home">Go to home</ButtonLink>
      <ButtonLink href="#stores" variant="outline" rightIcon="arrow_forward">
        Store details
      </ButtonLink>
      <ButtonLink href="#help" variant="ghost">
        Contact us
      </ButtonLink>
    </div>
  ),
};
