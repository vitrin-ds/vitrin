import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Stepper } from "./stepper";

const SIZES = ["lg", "md", "sm"] as const;

type Args = {
  size: (typeof SIZES)[number];
  error: boolean;
  disabled: boolean;
  inputValueText: number;
};

const meta = {
  title: "Components/Inputs/Stepper",
  // The defaults of Figma's `Stepper` (Size=Large, State=Default). Figma's `Input Value Text` is the
  // placeholder "Value": a real number is needed here.
  args: { size: "lg", error: false, disabled: false, inputValueText: 2 },
  // The value is internal state; the key restarts it when the control changes.
  render: ({ inputValueText, ...args }) => (
    <Stepper
      key={String(inputValueText)}
      label="Quantity"
      defaultValue={inputValueText}
      {...args}
    />
  ),
  parameters: {
    // The Figma properties: Size, State (Error, Disabled), Input Value Text.
    controls: { include: ["size", "error", "disabled", "inputValueText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for numeric values with clear min/max boundaries",
        "Display the current value clearly between the buttons",
        "Provide appropriate step increments for the use case (e.g., 1 for quantity, 0.5 for ratings)",
        "Use in e-commerce for quantity selection in cart or product pages",
      ],
      dont: [
        "Don't use for large numeric ranges — use Text Input instead",
        "Don't hide the current value",
        "Don't use for non-numeric inputs",
        "Don't allow values below minimum or above maximum limits",
      ],
    },
    docs: {
      description: {
        component:
          "A numeric input control that allows users to increase or decrease a value by predefined increments using plus and minus buttons. Hover and button Hover and Click are CSS states: use the pointer on the example to see them.",
      },
    },
  },
  argTypes: {
    size: {
      description: "Figma `Size`: Large 60 · Medium 52 · Small 36 tall.",
      control: "inline-radio",
      options: SIZES,
      table: {
        type: { summary: '"lg" | "md" | "sm"' },
        defaultValue: { summary: "lg" },
      },
    },
    error: {
      description: "Figma `State=Error`: explain the error next to the control.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
    inputValueText: {
      description: "Figma `Input Value Text`: the current number. In code: `defaultValue`.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "2" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A quantity with plus and minus buttons, e.g. in the cart. */
export const Default: Story = {};

/** Mirrors the Figma set: Size × Default · Error · Disabled · At Min · At Max (Hover / Buttons Hover / Click are CSS states). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-1 justify-items-start gap-24 tablet:grid-cols-3 desktop:grid-cols-5">
      {SIZES.flatMap((size) => [
        <Stepper key={`${size}-d`} label="Quantity" size={size} defaultValue={2} />,
        <Stepper key={`${size}-e`} label="Quantity" size={size} defaultValue={2} error />,
        <Stepper key={`${size}-x`} label="Quantity" size={size} defaultValue={2} disabled />,
        <Stepper key={`${size}-min`} label="Quantity" size={size} defaultValue={1} />,
        <Stepper key={`${size}-max`} label="Quantity" size={size} defaultValue={99} />,
      ])}
    </div>
  ),
};

/** At the minimum the minus button is disabled. */
export const AtMinimum: Story = { args: { inputValueText: 1 } };

/** Arrow keys change the value by one step. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="p-8">
      <Stepper label="Quantity" defaultValue={2} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const spin = within(canvasElement).getByRole("spinbutton", { name: "Quantity" });
    await expect(spin).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(spin).toHaveAttribute("aria-valuenow", "3");
  },
};
