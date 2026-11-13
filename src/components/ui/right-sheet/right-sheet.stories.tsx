import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { RightSheet, type RightSheetProps } from "./right-sheet";

function Demo(props: RightSheetProps) {
  const [open, setOpen] = useState(props.open);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Filters
      </Button>
      <RightSheet {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Figma's `Show Footer` is Storybook only: in code the footer shows when it is given. */
type Args = {
  showFooter: boolean;
  // Not Figma properties: the nested Toolbar title, and the step-back button (code only).
  title: string;
  showBack: boolean;
};

const meta = {
  title: "Components/Layout & Utility/Sheet/Right Sheet",
  // The defaults of Figma's `.Base.RightSheet` (State=Full).
  args: { showFooter: false, title: "Filters", showBack: false },
  render: ({ showFooter, title, showBack }) => (
    <Demo
      open
      onClose={() => undefined}
      title={title}
      subtitle="230 results"
      onBack={showBack ? () => undefined : undefined}
      footer={
        showFooter ? (
          <div className="flex gap-8">
            <Button variant="outline">Clear all</Button>
            <Button className="flex-1">Show 230 results</Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-16 p-20">
        {["Vegan", "Fragrance free", "Refillable", "On sale"].map((label) => (
          <Checkbox key={label} label={label} />
        ))}
      </div>
    </Demo>
  ),
  parameters: {
    // The Figma properties: Show Footer. State=Full is the only state; the Content slot and the
    // nested Toolbar.SidePanel.Title are not properties of the sheet; Show Scroll Bar is not built.
    controls: { include: ["showFooter"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for filters, mini cart, account menus, and contextual detail panels on desktop and tablet",
        "Leverage the Content slot to inject any layout — lists, forms, product summaries, filter groups",
        "Pair with a scrim/overlay behind the panel to indicate modal context",
        "Use Toolbar.SidePanel.Title's close icon to provide a clear dismiss action",
      ],
      dont: [
        "Don't use on mobile — prefer Sheet (bottom sheet) for small screens",
        "Don't use for critical flows like checkout — those deserve a full page",
        "Don't nest RightSheet inside other overlays like popups or sheets",
        "Don't remove the Toolbar.SidePanel.Title — users always need a way to close the panel",
      ],
    },
    docs: {
      description: {
        component:
          "A side panel overlay that slides in from the right edge of the screen, providing a spacious content area with a toolbar header — used for filters, mini cart, navigation drawers, and detail panels.",
      },
      story: { inline: false, iframeHeight: 560 },
    },
  },
  argTypes: {
    showFooter: {
      description: "Figma `Show Footer`: a fixed action bar. In code: pass `footer`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `State=Full`: filters, a mini cart or a detail panel on desktop and tablet. */
export const Default: Story = {};

/** `footer`: a fixed action bar (surface-raised + shadow-up) under the scrolling content. */
export const WithFooter: Story = { args: { showFooter: true } };

/** A step inside the sheet: arrow_back before the title (Add card, 03.03). Not drawn in Figma. */
export const WithBack: Story = { args: { title: "Add card", showBack: true } };
