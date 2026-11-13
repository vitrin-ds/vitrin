import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StepList, StepListItem } from "./step-list";

/** Figma's `Show Body` is Storybook only: in code the body shows when it is given. */
type Args = {
  numberText: number;
  titleText: string;
  showBody: boolean;
  bodyText: string;
};

// The rest of the list around the item the controls drive.
const OTHER_STEPS = [
  {
    title: "Choose the items",
    description: "Tick the items you're returning and tell us why.",
  },
  {
    title: "Print the label",
    description: "We'll email you a prepaid label. Attach it to the parcel.",
  },
  { title: "Drop it off" },
];

function steps({ titleText, showBody, bodyText }: Args) {
  return [{ title: titleText, description: showBody ? bodyText : undefined }, ...OTHER_STEPS];
}

const meta = {
  title: "Components/Data Display/Step List",
  // The defaults of Figma's `StepList.Item`.
  args: {
    numberText: 1,
    titleText: "Find your order",
    showBody: true,
    bodyText: "Go to My Account › Orders and select the order with the item you want to return.",
  },
  render: (args) => <StepList steps={steps(args)} />,
  parameters: {
    // The Figma properties of StepList.Item: Number Text, Title Text, Show Body, Body Text. The
    // list numbers its items by order, so Number Text is a control of the `Item` story only.
    // These controls drive the first item of the list.
    controls: { include: ["titleText", "showBody", "bodyText"] },
    figma: {
      architecture:
        "This is a Single-Layer component: no base layer, properties are on the component itself.",
      do: [
        "Start each title with a verb",
        "Keep 3–6 steps per list",
        "Use an ordered list (<ol>) in code",
        "Put the main CTA after the last step",
      ],
      dont: [
        "Don't nest step lists",
        "Don't use for non-sequential content — use a bullet list",
        "Don't skip numbers",
        "Don't put links-only steps",
      ],
    },
    docs: {
      description: {
        component:
          "A numbered step with a title and description. Stack items vertically (20px spacing) to explain a process, e.g. how to return an item.",
      },
    },
  },
  argTypes: {
    numberText: {
      description:
        "Figma `Number Text`. In code: `number` of `StepListItem`; a `StepList` numbers its items by order.",
      control: "number",
      table: { type: { summary: "number" }, defaultValue: { summary: "1" } },
    },
    titleText: {
      description: "Figma `Title Text`: starts with a verb. In code: `title`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "Find your order" } },
    },
    showBody: {
      description: "Figma `Show Body`. In code: pass `description`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    bodyText: {
      description: "Figma `Body Text`. In code: `description`.",
      control: "text",
      if: { arg: "showBody" },
      table: {
        type: { summary: "ReactNode" },
        defaultValue: {
          summary:
            "Go to My Account › Orders and select the order with the item you want to return.",
        },
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

/** A step list (items 20 apart); the last step has no body (Figma `Show Body=false`). */
export const Default: Story = {};

/** Step titles as H3 headings, for help articles where steps are sections. */
export const WithHeadings: Story = {
  render: (args) => <StepList steps={steps(args)} headingLevel={3} />,
};

/** Figma `StepList.Item` on its own. */
export const Item: Story = {
  parameters: { controls: { include: ["numberText", "titleText", "showBody", "bodyText"] } },
  render: ({ numberText, titleText, showBody, bodyText }) => (
    <ol>
      <StepListItem
        number={numberText}
        title={titleText}
        description={showBody ? bodyText : undefined}
      />
    </ol>
  ),
};
