import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spinner, type SpinnerProps } from "./spinner";

type Args = {
  size: SpinnerProps["size"];
};

const SIZES = ["lg", "md", "sm", "xs"] as const;

const meta = {
  title: "Components/Feedback/Spinner",
  // The default of Figma's `Spinner`.
  args: { size: "xs" },
  render: ({ size }) => <Spinner size={size} label="Loading" />,
  parameters: {
    // The Figma property: Size.
    controls: { include: ["size"] },
    figma: {
      architecture: "Single-Layer Architecture",
      do: [
        "Use to indicate loading states for buttons, sections, or full pages",
        "Match size to context — X-Small for buttons, Large for page loading",
        "Center within the loading area",
        'Consider adding a text label for longer waits ("Loading...", "Please wait")',
      ],
      dont: [
        "Don't use multiple spinners in the same view",
        "Don't use for instant actions — only for noticeable delays (>300ms)",
        "Don't block the entire UI if only a section is loading",
        "Don't use without proper contrast against the background",
      ],
    },
    docs: {
      description: {
        component:
          "A loading indicator that communicates an ongoing process or content being fetched.",
      },
    },
  },
  argTypes: {
    size: {
      description:
        "Figma `Size`: Large 32 · Medium 24 · Small 16 · X-Small 12. In code: `lg` | `md` | `sm` | `xs`.",
      control: "inline-radio",
      options: SIZES,
      table: { type: { summary: '"lg" | "md" | "sm" | "xs"' }, defaultValue: { summary: "xs" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** A noticeable delay in a button, a section or a whole page. */
export const Default: Story = {};

/** Figma: X-Small 12 · Small 16 · Medium 24 · Large 32. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-48">
      {SIZES.map((size) => (
        <Spinner key={size} size={size} label={`Loading (${size})`} />
      ))}
    </div>
  ),
};

/** Longer waits get a visible label next to the spinner. */
export const WithVisibleText: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <Spinner size="sm" label={null} />
      <p role="status" className="text-body-md text-text-secondary">
        Loading your orders…
      </p>
    </div>
  ),
};
