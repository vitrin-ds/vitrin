import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PasswordStrength } from "./password-strength";

const meta = {
  title: "Components/Feedback/Password Strength",
  component: PasswordStrength,
  args: { label: "STRENGTH", score: 3, verdict: "Good" },
  // No Figma page and no Figma properties.
  parameters: { controls: { include: [] } },
} satisfies Meta<typeof PasswordStrength>;

export default meta;

/** Every score from empty to Strong. */
export const Scores: StoryObj<typeof meta> = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-676 flex-col gap-20">
      <PasswordStrength label="STRENGTH" score={0} verdict="" />
      <PasswordStrength label="STRENGTH" score={1} verdict="Weak" />
      <PasswordStrength label="STRENGTH" score={2} verdict="Fair" />
      <PasswordStrength label="STRENGTH" score={3} verdict="Good" />
      <PasswordStrength label="STRENGTH" score={4} verdict="Strong" />
    </div>
  ),
};
