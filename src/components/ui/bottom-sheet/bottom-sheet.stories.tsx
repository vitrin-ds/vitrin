import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../button/button";
import { Radio, RadioGroup } from "../radio/radio";
import { BottomSheet, type BottomSheetProps } from "./bottom-sheet";

function Demo(props: BottomSheetProps) {
  const [open, setOpen] = useState(props.open);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Sort
      </Button>
      <BottomSheet {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const SortOptions = (
  <div className="p-16">
    <RadioGroup legend="Sort by">
      <Radio name="sort" value="relevance" label="Relevance" defaultChecked />
      <Radio name="sort" value="price-asc" label="Price: Low to High" />
      <Radio name="sort" value="price-desc" label="Price: High to Low" />
      <Radio name="sort" value="new" label="Newest" />
    </RadioGroup>
  </div>
);

/** Figma's `Show Footer` is Storybook only: in code the footer shows when it is given. */
type Args = { state: "half" | "full"; showFooter: boolean };

const STATES = ["half", "full"] as const;

const meta = {
  title: "Components/Layout & Utility/Sheet/Bottom Sheet",
  // The defaults of Figma's `BottomSheet` (State=Half) and its `.Base.BottomSheet`.
  args: { state: "half", showFooter: false },
  render: ({ state, showFooter }) => (
    <Demo
      open
      onClose={() => undefined}
      title="Sort"
      subtitle="230 results"
      state={state}
      onBack={state === "full" ? () => undefined : undefined}
      footer={
        showFooter ? (
          <div className="flex gap-8">
            <Button variant="outline">Reset</Button>
            <Button className="flex-1">Apply</Button>
          </div>
        ) : undefined
      }
    >
      {SortOptions}
    </Demo>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    // The Figma properties: State, Show Footer. The Content slot and the nested
    // Toolbar.Sheet.Title (Main Title, Sub Title) are not properties of the sheet.
    controls: { include: ["state", "showFooter"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Half state for quick interactions like filters, sort options, or confirmations",
        "Use Full state for complex flows like forms, multi-step wizards, or detailed content",
        "Leverage the Content slot to inject any layout — lists, forms, product details, etc.",
        "Pair with a scrim/overlay behind the sheet to indicate modal context",
      ],
      dont: [
        "Don't use sheets on desktop — prefer modals or side panels instead",
        "Don't nest sheets inside other sheets — flatten the flow or navigate to a new screen",
        "Don't use Half state for content that exceeds the visible area — switch to Full",
        "Don't remove the Toolbar.Sheet.Title — users always need a way to dismiss",
      ],
    },
    docs: {
      description: {
        component:
          "A bottom sheet overlay that slides up from the bottom of the screen, providing a contextual content area with a toolbar header — available in half-screen and full-screen states.",
      },
      story: { inline: false, iframeHeight: 560 },
    },
  },
  argTypes: {
    state: {
      description: "Figma `State`: Full covers the entire screen, Half the lower portion.",
      control: "inline-radio",
      options: STATES,
      table: {
        type: { summary: '"half" | "full"' },
        defaultValue: { summary: "half" },
      },
    },
    showFooter: {
      description: "Figma `Show Footer`: a fixed action bar. In code: pass `footer`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma `State=Half`: quick choices. */
export const Half: Story = {};

/** Figma `State=Full` with the back button. */
export const Full: Story = { args: { state: "full" } };

/** `footer`: a fixed action bar (surface-raised + shadow-up) under the scrolling content. */
export const WithFooter: Story = { args: { showFooter: true } };
