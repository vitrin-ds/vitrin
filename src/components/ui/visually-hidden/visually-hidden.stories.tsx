import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "../icon/icon";
import { VisuallyHidden } from "./visually-hidden";

const meta = {
  title: "Foundations/VisuallyHidden",
  component: VisuallyHidden,
  args: { children: "Add to wishlist" },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The button has an accessible name but only the icon is visible. */
export const IconButtonLabel: Story = {
  render: (args) => (
    <button
      type="button"
      className="inline-flex size-44 items-center justify-center rounded-full border border-border-default"
    >
      <Icon name="favorite" fill={false} />
      <VisuallyHidden {...args} />
    </button>
  ),
};

/** Tab into the frame: the skip link appears while it has focus. */
export const SkipLink: Story = {
  args: { children: "Skip to content" },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <VisuallyHidden
        as="a"
        href="#content"
        focusable
        className="w-fit rounded-4 bg-surface-primary px-12 py-8 text-label-lg text-text-accent"
      >
        {args.children}
      </VisuallyHidden>
      <p id="content" className="text-body-md text-text-secondary">
        Press Tab to reveal the skip link above this text.
      </p>
    </div>
  ),
};
