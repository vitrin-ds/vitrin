import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Divider } from "./divider";

type Args = { tone: "neutral" | "strong"; usage: "full-width" | "inset" };

const USAGES = ["full-width", "inset"] as const;

const meta = {
  title: "Components/Layout & Utility/Divider",
  // The default of Figma's `Divider`.
  args: { tone: "neutral", usage: "full-width" },
  render: ({ tone, usage }) => <Divider tone={tone} usage={usage} />,
  parameters: {
    // The Figma property: Usage. The Base layer has no configurable properties.
    controls: { include: ["tone", "usage"] },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Use Full Width to separate major content sections (e.g., between page blocks)",
        "Use Inset within lists and grouped content where the divider should align with text, not edges",
        "Use sparingly — whitespace alone is often sufficient to create visual separation",
      ],
      dont: [
        "Don't stack multiple dividers — one is enough",
        "Don't use dividers between every element — reserve for meaningful content boundaries",
        "Don't use Full Width inside padded containers like cards or modals — prefer Inset",
      ],
    },
    docs: {
      description: {
        component:
          "A simple horizontal line used to visually separate content sections or list items.",
      },
    },
  },
  argTypes: {
    tone: {
      description:
        "Figma `Tone`: Neutral (border-neutral) · Strong (border-strong, for content rows on a plain surface).",
      control: "inline-radio",
      options: ["neutral", "strong"],
      table: { type: { summary: '"neutral" | "strong"' }, defaultValue: { summary: "neutral" } },
    },
    usage: {
      description:
        "Figma `Usage` (code: full-width · inset): Full Width spans edge to edge; Inset adds horizontal padding.",
      control: "inline-radio",
      options: USAGES,
      table: {
        type: { summary: USAGES.map((value) => `"${value}"`).join(" | ") },
        defaultValue: { summary: "full-width" },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-300 bg-bg-secondary py-20">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Full Width separates major content sections, edge to edge (300px sample). */
export const FullWidth: Story = { args: { usage: "full-width" } };

/** Inset (16px on each side) inside lists and padded containers, aligned with the text. */
export const Inset: Story = { args: { usage: "inset" } };

/** Tone Strong: rows of content on a plain surface (Product Detail Good to know · Application · Ingredients). */
export const Strong: Story = { args: { tone: "strong" } };

/** Inset dividers between the rows of a list. */
export const InAList: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ul className="bg-surface-primary">
      {["Orders", "Addresses", "Payment methods"].map((item, i) => (
        <li key={item}>
          {i > 0 ? <Divider usage="inset" decorative /> : null}
          <p className="px-16 py-12 text-body-md text-text-primary">{item}</p>
        </li>
      ))}
    </ul>
  ),
};
