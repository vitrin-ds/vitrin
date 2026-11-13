import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { PopUp, type PopUpProps } from "./pop-up";

function Demo(props: Omit<PopUpProps, "onClose">) {
  const [open, setOpen] = useState(props.open);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open pop-up
      </Button>
      <PopUp {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta = {
  title: "Components/Layout & Utility/Pop Up",
  component: PopUp,
  args: {
    open: true,
    onClose: () => undefined,
    title: "Title",
    subtitle: "Subtitle",
    children: (
      <div className="flex h-165 items-center justify-center bg-surface-secondary text-body-sm text-text-tertiary">
        Content
      </div>
    ),
  },
  render: (args) => <Demo {...args} />,
  parameters: {
    // The Figma property: State (Default only). The Content slot is `children`; the header is
    // Toolbar.PopUp.Title (`title`, `subtitle`).
    controls: { include: ["title", "subtitle"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for focused, interruptive tasks that require user attention (confirmations, alerts, quick selections)",
        "Keep popup content concise — this is not a page replacement",
        "Leverage the Content slot to inject contextual content like forms, lists, or action groups",
        "Always provide a clear dismiss action via the Toolbar.PopUp.Title's right icon",
      ],
      dont: [
        "Don't use popups for complex multi-step flows — use Sheet (Full) or a dedicated page instead",
        "Don't use on mobile for content that benefits from more space — prefer Sheet instead",
        "Don't stack multiple popups — dismiss the current one before opening another",
        "Don't use without a scrim/overlay — users need to understand the modal context",
      ],
    },
    docs: {
      description: {
        component:
          "A centered modal overlay surface for focused interactions like confirmations, alerts, and compact forms — featuring a toolbar header and a slotted content area.",
      },
      story: { inline: false, iframeHeight: 420 },
    },
  },
} satisfies Meta<typeof PopUp>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Figma default: Toolbar.PopUp.Title and a 165px Content slot. */
export const Default: Story = {};

/** A quick selection in the Content slot. */
export const WithActions: Story = {
  args: {
    title: "Remove item?",
    subtitle: undefined,
    children: (
      <div className="flex flex-col gap-16 px-20 pb-20">
        <p className="text-body-md text-text-secondary">
          Rose Body Cream will be removed from your bag.
        </p>
        <div className="flex justify-end gap-8">
          <Button variant="outline">Keep</Button>
          <Button>Remove</Button>
        </div>
      </div>
    ),
  },
};
