import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressSteps } from "./progress";

const STATES = [
  "All Empty",
  "Step 1 OK",
  "Step 2 OK",
  "Step 3 OK",
  "Step 4 OK",
  "Step 5 OK",
  "Step 6 OK",
] as const;

/** Figma's properties. Storybook only: in code `completed` and `steps` say the same. */
type Args = {
  state: (typeof STATES)[number];
  showStep3: boolean;
  showStep4: boolean;
  showStep5: boolean;
  showStep6: boolean;
};

const showStep = (step: number) => ({
  description: `Figma \`Show Step ${step}\`. In code: \`steps\`, the number of steps in the flow.`,
  control: "boolean" as const,
  table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
});

const meta = {
  title: "Components/Feedback/Progress Bar/Progress with Steps",
  // The defaults of Figma's `ProgresswithSteps`.
  args: { state: "All Empty", showStep3: true, showStep4: true, showStep5: true, showStep6: true },
  render: ({ state, showStep3, showStep4, showStep5, showStep6 }) => {
    const shown = [showStep3, showStep4, showStep5, showStep6].filter(Boolean).length;
    const steps = (2 + shown) as 2 | 3 | 4 | 5 | 6;
    return <ProgressSteps label="Checkout" steps={steps} completed={STATES.indexOf(state)} />;
  },
  parameters: {
    figma: {
      architecture: "Single-Layer Architecture",
      do: [
        "Match the State to the user's current step — completed steps should be visually filled",
        "Hide unused steps to match the actual flow length (e.g., hide Step 5 and 6 for a 4-step checkout)",
        "Place at the top of the page, below the header, for consistent visibility throughout the flow",
        "Use in combination with Main Header [Compact] for focused conversion flows",
      ],
      dont: [
        "Don't show more steps than the flow actually contains — hide extras with the Show toggles",
        "Don't skip states — progress should always advance sequentially from All Empty onward",
        "Don't use for non-linear flows where users can complete steps in any order",
        "Don't place inside scrollable content — keep it fixed or at the very top for constant orientation",
      ],
    },
    docs: {
      description: {
        component:
          "A horizontal step progress indicator that visually tracks completion through a multi-step flow — used in checkout, registration, onboarding, and any sequential process with defined stages.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: current completion stage, fills steps progressively. In code: `completed` (All Empty = 0).",
      control: "select",
      options: STATES,
      table: { type: { summary: "string" }, defaultValue: { summary: "All Empty" } },
    },
    showStep3: showStep(3),
    showStep4: showStep(4),
    showStep5: showStep(5),
    showStep6: showStep(6),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Figma defaults. */
export const Default: Story = {};

/** Step 2 of a four-step checkout: Step 5 and 6 hidden. */
export const Checkout: Story = {
  args: { state: "Step 2 OK", showStep5: false, showStep6: false },
};
