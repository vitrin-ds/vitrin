import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PasswordRequirements } from "./password-requirements";

const meta = {
  title: "Patterns/Other/Password Requirements",
  component: PasswordRequirements,
  args: { id: "password-rules", password: "abcdefgh" },
  decorators: [
    (Story) => (
      <div className="w-448">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordRequirements>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma "The Password does not meet the criteria.": red border, unmet rules red. */
export const NotMet: Story = {};

/** Figma "The password meets the criteria.": everything green. */
export const AllMet: Story = { args: { password: "Things-2026" } };
