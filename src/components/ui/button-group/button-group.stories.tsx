import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { ICON_NAMES, type IconName } from "../icon/icon-names";
import { ButtonGroup, type ButtonGroupItem, type ButtonGroupProps } from "./button-group";

const ITEMS: ButtonGroupItem[] = [
  { value: "grid", children: "Grid", leftIcon: "add" },
  { value: "list", children: "List", leftIcon: "add" },
  { value: "map", children: "Map", leftIcon: "add" },
];

function Controlled(props: Omit<ButtonGroupProps, "value" | "onValueChange">) {
  const [value, setValue] = useState(props.items[0].value);
  return <ButtonGroup {...props} value={value} onValueChange={setValue} />;
}

/** Figma's `Show` booleans. Storybook only: in code a segment shows what it is given. */
type Args = {
  variant: ButtonGroupProps["variant"];
  size: ButtonGroupProps["size"];
  disabled: boolean;
  showLeftIcon: boolean;
  leftIcon: IconName;
  showText: boolean;
  segmentText: string;
};

const SEGMENTS = [1, 2, 3] as const;

const meta = {
  title: "Components/Actions/Button Group",
  // The defaults of Figma's `Button Group` and its `.Base Segment`.
  args: {
    variant: "accent",
    size: "lg",
    disabled: false,
    showLeftIcon: true,
    leftIcon: "add",
    showText: true,
    segmentText: "Segment",
  },
  // Three segments, numbered; Position (Left · Center · Right) is derived from the order.
  render: ({ showLeftIcon, leftIcon, showText, segmentText, disabled, ...args }) => (
    <Controlled
      label="View"
      items={SEGMENTS.map((n) => ({
        value: `segment-${n}`,
        children: showText ? `${segmentText} ${n}` : undefined,
        "aria-label": showText ? undefined : `${segmentText} ${n}`,
        leftIcon: showLeftIcon ? leftIcon : undefined,
        disabled,
      }))}
      {...args}
    />
  ),
  parameters: {
    // The Figma properties: Style, State Disabled, Size, Left Icon, Segment Text. Position is derived.
    controls: {
      include: [
        "variant",
        "disabled",
        "size",
        "showLeftIcon",
        "leftIcon",
        "showText",
        "segmentText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for mutually exclusive options like view toggles or filters",
        "Keep segment count between 2–5 for optimal usability",
        "Use consistent labeling style across all segments (all icons, all text, or icon + text)",
        "Ensure all segments have equal importance in the context",
      ],
      dont: [
        "Don't use for primary actions — use Button instead",
        "Don't mix different sizes within the same group",
        "Don't use for navigation — use Tabs or Navigation components",
        "Don't combine destructive actions with neutral ones in the same group",
      ],
    },
    docs: {
      description: {
        component:
          "A container component for organizing related actions into a cohesive, visually connected set with consistent spacing and alignment. Hover and Active are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    variant: {
      description: "Figma `Style`: Accent or White.",
      control: "inline-radio",
      options: ["accent", "white"],
      table: {
        type: { summary: '"accent" | "white"' },
        defaultValue: { summary: "accent" },
      },
    },
    disabled: {
      description:
        "Figma `State=Disabled`. Here it disables every segment; in code it is per item.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    size: {
      description: "Figma `Size`: Large 52 · Medium 44 · Small 36 tall.",
      control: "inline-radio",
      options: ["lg", "md", "sm"],
      table: {
        type: { summary: '"lg" | "md" | "sm"' },
        defaultValue: { summary: "lg" },
      },
    },
    showLeftIcon: {
      description: "Figma `Show Left Icon`. In code: pass `leftIcon` on the item.",
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
    showText: {
      description:
        "Figma `Show Text`. Off: icon-only, and the text becomes the segment's `aria-label`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    segmentText: {
      description: "Figma `Segment Text`. In code: `children` of the item. The story numbers it.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Segment" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Mutually exclusive views or filters, Accent. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Segment 2" }));
    await expect(canvas.getByRole("button", { name: "Segment 2" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};

/** The quieter Style, for toolbars and filter bars. */
export const White: Story = { args: { variant: "white" } };

/** Both styles in every size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-16">
      {(["accent", "white"] as const).flatMap((variant) =>
        (["lg", "md", "sm"] as const).map((size) => (
          <Controlled
            key={`${variant}-${size}`}
            label={`${variant} ${size}`}
            items={ITEMS}
            variant={variant}
            size={size}
          />
        )),
      )}
    </div>
  ),
};

/** Figma `State=Disabled`: the whole group, or one segment. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-16">
      {(["accent", "white"] as const).map((variant) => (
        <Controlled
          key={variant}
          label={variant}
          variant={variant}
          items={ITEMS.map((item) => ({ ...item, disabled: true }))}
        />
      ))}
      <Controlled
        label="One disabled"
        variant="white"
        items={ITEMS.map((item) => ({ ...item, disabled: item.value === "map" }))}
      />
    </div>
  ),
};

/** Figma `Show Text` off: each segment needs an accessible name. */
export const IconOnly: Story = {
  args: { variant: "white", showText: false },
};
