import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    // Figma: no configurable properties. Every story renders fixed examples.
    controls: { disable: true },
    figma: {
      do: [
        "Use to indicate content layout before data loads",
        "Match skeleton shapes to expected content (text, image, card)",
        "Replace with actual content smoothly when loaded",
      ],
      dont: [
        "Don't use for actions/interactions — use Spinner instead",
        "Don't animate too aggressively — subtle pulse is enough",
        "Don't show for more than a few seconds",
      ],
    },
    docs: {
      description: {
        component:
          "A placeholder component that mimics content layout while data is loading, providing visual structure before actual content appears.",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Figma sample: 270 × 36. */
export const Default: Story = {
  render: () => (
    <span className="block h-36 w-270">
      <Skeleton />
    </span>
  ),
};

/** Code adds shapes (text, block, circle) so a placeholder matches the content it stands in for. */
export const Shapes: Story = {
  render: () => (
    <div className="flex w-300 flex-col gap-16">
      <span className="block size-48">
        <Skeleton shape="circle" />
      </span>
      <p className="text-title-md">
        <Skeleton shape="text" />
      </p>
      <p className="text-body-md">
        <Skeleton shape="text" />
      </p>
      <span className="block h-120">
        <Skeleton shape="block" />
      </span>
    </div>
  ),
};

/** A product card placeholder; the region announces loading once. */
export const ProductCard: Story = {
  render: () => (
    <div
      role="group"
      aria-busy="true"
      aria-label="Loading product"
      className="flex w-270 flex-col gap-12"
    >
      <span className="block aspect-square">
        <Skeleton />
      </span>
      <p className="text-body-md">
        <Skeleton shape="text" />
      </p>
      <p className="w-1/2 text-title-sm">
        <Skeleton shape="text" />
      </p>
    </div>
  ),
};
