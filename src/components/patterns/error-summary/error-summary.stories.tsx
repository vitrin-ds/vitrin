import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorSummary } from "./error-summary";

const meta = {
  title: "Patterns/Other/Error Summary",
  component: ErrorSummary,
  args: {
    id: "error-summary",
    title: "Check the highlighted fields",
    errors: [
      { id: "email", label: "E-mail", message: "Enter your e-mail address." },
      { id: "password", label: "Password", message: "Enter your password." },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-448">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** After a failed submit: every field error, each linking to its field. */
export const FieldErrors: Story = {};

/** Figma 01.01.01.P0O3 Wrong Combination: one message, no field links. */
export const MessageOnly: Story = {
  args: {
    title: "The e-mail or password you entered is incorrect. Please try again.",
    errors: [],
  },
};
