import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../button/button";
import { Tooltip, type TooltipAlign, type TooltipSide } from "./tooltip";

const POSITIONS = {
  "Top Center": ["top", "center"],
  "Top Left": ["top", "start"],
  "Top Right": ["top", "end"],
  "Bottom Right": ["bottom", "end"],
  "Bottom Center": ["bottom", "center"],
  "Bottom Left": ["bottom", "start"],
  "Left Bottom": ["left", "end"],
  "Left Center": ["left", "center"],
  "Left Top": ["left", "start"],
  "Right Bottom": ["right", "end"],
  "Right Center": ["right", "center"],
  "Right Top": ["right", "start"],
} as const satisfies Record<string, readonly [TooltipSide, TooltipAlign]>;

type Position = keyof typeof POSITIONS;

type Args = {
  position: Position;
  body: string;
};

const meta = {
  title: "Components/Feedback/Tooltip",
  // The defaults of Figma's `Tooltip` and `.Base Tooltip`.
  args: {
    position: "Top Left",
    body: "Here is some helpful explainer text to assist the user in understanding how a certain feature works.....",
  },
  render: ({ position, body }) => {
    const [side, align] = POSITIONS[position];
    return (
      <Tooltip content={body} side={side} align={align}>
        <Button variant="outline" leftIcon="info" aria-label="Delivery information" />
      </Tooltip>
    );
  },
  parameters: {
    // The Figma properties: Position, Body.
    controls: { include: ["position", "body"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use for supplementary information that clarifies UI elements",
        "Keep text brief — ideally under 2 lines",
        "Position to avoid obscuring important content",
        "Use consistent positioning for similar elements",
      ],
      dont: [
        "Don't use for essential information — it should be optional context",
        "Don't include interactive elements inside tooltips",
        "Don't use for error messages — use inline validation instead",
        "Don't make tooltips too wide — max 200-280px recommended",
      ],
    },
    docs: {
      description: {
        component:
          "A small contextual overlay that displays helpful information when users hover over or focus on an element.",
      },
    },
  },
  argTypes: {
    position: {
      description:
        "Figma `Position`: the edge of the trigger and where along it the tooltip aligns. In code: `side` and `align` (`Left` / `Top` = `start`, `Right` / `Bottom` = `end`).",
      control: "select",
      options: Object.keys(POSITIONS),
      table: {
        type: {
          summary: Object.keys(POSITIONS)
            .map((value) => `"${value}"`)
            .join(" | "),
        },
        defaultValue: { summary: "Top Left" },
      },
    },
    body: {
      description: "Figma `Body`. In code: `content`.",
      control: "text",
      table: { type: { summary: "ReactNode" } },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex h-320 items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Supplementary context for a UI element, open through keyboard focus (as in the snapshot). */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("tooltip")).toBeVisible();
  },
};

const PLACEMENTS: [TooltipSide, TooltipAlign][] = [
  ["bottom", "start"],
  ["bottom", "center"],
  ["bottom", "end"],
  ["right", "start"],
];

/** Placement relative to the trigger; the arrow faces it. */
export const Placements: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    (Story) => (
      <div className="h-320">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="flex flex-wrap gap-24">
      {PLACEMENTS.map(([side, align]) => (
        <Tooltip key={`${side}-${align}`} content={`${side} ${align}`} side={side} align={align}>
          <Button variant="outline" size="sm">{`${side} ${align}`}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};
