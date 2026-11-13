import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { FloatingActionButton, type FloatingActionButtonProps } from "./floating-action-button";

const VARIANTS = ["filled", "outline"] as const;
const SIZES = ["lg", "md", "sm"] as const;

type Args = {
  variant: FloatingActionButtonProps["variant"];
  size: FloatingActionButtonProps["size"];
  disabled: boolean;
  icon: IconName;
};

const meta = {
  title: "Components/Actions/Floating Action Button",
  // The defaults of Figma's `Floating Action Button` and its `.Base Floating Action Button`.
  args: { variant: "filled", size: "lg", disabled: false, icon: "add" },
  // The Figma properties have no text: the accessible name is the icon's name.
  render: ({ icon, ...args }) => (
    <FloatingActionButton {...args} icon={icon} aria-label={icon.replaceAll("_", " ")} />
  ),
  parameters: {
    // The Figma properties: Style, Size, State Disabled, Icon.
    controls: { include: ["variant", "size", "disabled", "icon"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for the single most important action on a screen",
        "Position consistently in the bottom-right corner",
        "Keep the icon simple and universally recognizable",
        "Ensure sufficient contrast against varying background content",
      ],
      dont: [
        "Don't use more than one FAB per screen",
        "Don't use for minor or secondary actions",
        "Don't place over important content or navigation elements",
        "Don't use text labels — rely on clear iconography instead",
      ],
    },
    docs: {
      description: {
        component:
          "A prominent, elevated button for the primary action on a screen, typically positioned at a fixed location to remain accessible during scrolling.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "Figma `Style`: visual theme.",
      control: "inline-radio",
      options: VARIANTS,
      table: {
        type: { summary: '"filled" | "outline"' },
        defaultValue: { summary: "filled" },
      },
    },
    size: {
      description: "Figma `Size`: Large 52 · Medium 44 · Small 36.",
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
    icon: {
      description: "Figma `Icon`: a Material Symbols name.",
      control: "select",
      options: ICON_NAMES,
      table: { type: { summary: "IconName" }, defaultValue: { summary: "add" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The single most important action on a screen. */
export const Default: Story = {};

/** Over a busy background where a white surface reads better. */
export const Outline: Story = { args: { variant: "outline" } };

/** Every Style × Size, Default and Disabled. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 items-center justify-items-start gap-16 p-16 tablet:grid-cols-4">
      {SIZES.flatMap((size) =>
        VARIANTS.flatMap((variant) =>
          [false, true].map((disabled) => (
            <FloatingActionButton
              key={`${size}-${variant}-${disabled}`}
              icon="add"
              aria-label="Add"
              variant={variant}
              size={size}
              disabled={disabled}
            />
          )),
        ),
      )}
    </div>
  ),
};
