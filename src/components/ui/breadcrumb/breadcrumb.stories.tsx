import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

/** Figma's `Show` booleans. Storybook only: in code a node shows when it is in `items`. */
type Args = {
  showNode2: boolean;
  node2Text: string;
  showNode3: boolean;
  node3Text: string;
  showNode4: boolean;
  node4Text: string;
  activeNodeText: string;
};

const LEVELS: BreadcrumbItem[] = [
  { label: "Skincare", href: "/c/skincare" },
  { label: "Face", href: "/c/skincare/face" },
  { label: "Serums", href: "/c/skincare/face/serums" },
];

const meta = {
  title: "Components/Navigation/Breadcrumb",
  // The defaults of Figma's `Breadcrumb`.
  args: {
    showNode2: true,
    node2Text: "Things",
    showNode3: true,
    node3Text: "Things",
    showNode4: true,
    node4Text: "Things",
    activeNodeText: "Things",
  },
  render: ({
    showNode2,
    node2Text,
    showNode3,
    node3Text,
    showNode4,
    node4Text,
    activeNodeText,
  }) => {
    const items: BreadcrumbItem[] = [
      ...(showNode2 ? [{ label: node2Text, href: "#node-2" }] : []),
      ...(showNode3 ? [{ label: node3Text, href: "#node-3" }] : []),
      ...(showNode4 ? [{ label: node4Text, href: "#node-4" }] : []),
    ];
    return <Breadcrumb items={items} current={activeNodeText} />;
  },
  parameters: {
    // The Figma properties: Show Node [2-4], Node [2-4] Text, Active Node Text.
    controls: {
      include: [
        "showNode2",
        "node2Text",
        "showNode3",
        "node3Text",
        "showNode4",
        "node4Text",
        "activeNodeText",
      ],
    },
    figma: {
      do: [
        "Always start with Home (implicit first node)",
        "Make all nodes except Active Node clickable",
        "Use consistent separator between nodes (/ or >)",
        "Keep node labels concise — match page titles",
      ],
      dont: [
        "Don't include more than 5 levels — simplify IA if needed",
        "Don't make the Active Node clickable — it's the current page",
        "Don't truncate middle nodes without indication (use ellipsis if needed)",
        "Don't use breadcrumbs for linear flows — use Stepper instead",
      ],
    },
    docs: {
      description: {
        component:
          "A navigational aid that displays the user's current location within the site hierarchy, enabling quick navigation to parent pages.",
      },
    },
  },
  argTypes: {
    showNode2: {
      description: "Figma `Show Node [2]`. In code: add the node to `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    node2Text: {
      description: "Figma `Node [2] Text`. In code: `items[].label`, linked.",
      control: "text",
      if: { arg: "showNode2" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Things" } },
    },
    showNode3: {
      description: "Figma `Show Node [3]`. In code: add the node to `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    node3Text: {
      description: "Figma `Node [3] Text`. In code: `items[].label`, linked.",
      control: "text",
      if: { arg: "showNode3" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Things" } },
    },
    showNode4: {
      description: "Figma `Show Node [4]`. In code: add the node to `items`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    node4Text: {
      description: "Figma `Node [4] Text`. In code: `items[].label`, linked.",
      control: "text",
      if: { arg: "showNode4" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Things" } },
    },
    activeNodeText: {
      description: "Figma `Active Node Text`. In code: `current`, the page itself, not a link.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "Things" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Where the user is in the site hierarchy: Home, three ancestors and the current page. */
export const Default: Story = {};

/** Show Node [n] off: fewer ancestors. */
export const Levels: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-24">
      <Breadcrumb items={[]} current="Skincare" label="Breadcrumb, 1 level" />
      <Breadcrumb items={LEVELS.slice(0, 1)} current="Face" label="Breadcrumb, 2 levels" />
      <Breadcrumb items={LEVELS} current="Glow serum 30 ml" label="Breadcrumb, 4 levels" />
    </div>
  ),
};
