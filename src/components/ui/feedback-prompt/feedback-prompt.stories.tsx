import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  FEEDBACK_PROMPT_LABELS,
  FeedbackPrompt,
  type FeedbackPromptProps,
} from "./feedback-prompt";

type Args = {
  state: "Default" | "Answered";
  questionText: string;
  onAnswer: FeedbackPromptProps["onAnswer"];
};

const STATES = ["Default", "Answered"] as const;

const meta = {
  title: "Components/Feedback/Feedback Prompt",
  // The defaults of Figma's `FeedbackPrompt` and `.Base.FeedbackPrompt`.
  args: { state: "Default", questionText: "Was this article helpful?", onAnswer: fn() },
  render: ({ state, questionText, onAnswer }) => (
    <FeedbackPrompt
      answered={state === "Answered" ? true : undefined}
      labels={{ ...FEEDBACK_PROMPT_LABELS, question: questionText }}
      onAnswer={onAnswer}
    />
  ),
  parameters: {
    // The Figma properties: State, Question Text. `Show Actions` is not a control: the code
    // hides the actions only through State=Answered.
    controls: { include: ["state", "questionText"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Place it at the end of the content",
        "Ask one short question",
        "Switch to Answered right after a click",
        "Offer a follow-up (e.g. contact) only after a No",
      ],
      dont: [
        "Don't interrupt reading with a modal",
        "Don't ask for ratings and comments at once",
        "Don't use more than one prompt per page",
        "Don't block the page if feedback fails to send",
      ],
    },
    docs: {
      description: {
        component:
          "An inline prompt asking whether content was helpful, with Yes / No actions and a thank-you state. Used at the end of articles, help topics and legal documents.",
      },
    },
  },
  argTypes: {
    state: {
      description:
        "Figma `State`: Default shows the question, Answered the thank-you message with the actions hidden. In code: `answered`.",
      control: "inline-radio",
      options: STATES,
      table: { type: { summary: '"Default" | "Answered"' }, defaultValue: { summary: "Default" } },
    },
    questionText: {
      description: "Figma `Question Text`. In code: `labels.question`.",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Was this article helpful?" },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-790">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The question with Yes / No at the end of the content. Clicking switches to Answered. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "No" }));
    await expect(args.onAnswer).toHaveBeenCalledWith("no");
    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("Thanks");
    await expect(status).toHaveFocus();
  },
};

/** The thank-you message, shown right after a click. */
export const Answered: Story = { args: { state: "Answered" } };

/** Mobile width: the actions wrap below the question. */
export const Narrow: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="max-w-343">
        <Story />
      </div>
    ),
  ],
};
