import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  TABLE_OF_CONTENTS_LABELS,
  TableOfContents,
  TableOfContentsItem,
  type TableOfContentsProps,
} from "./table-of-contents";

/** Figma's `Show` booleans. Storybook only: in code the progress shows when it is given. */
type Args = {
  layout: TableOfContentsProps["layout"];
  titleText: string;
  showProgress: boolean;
  progress: number;
  minutesLeft: number;
  /** Sticky Bar `Caption Text`; blank builds it from the progress. */
  captionText: string;
  /** Sticky Bar `Current Text`; blank uses the active item. */
  currentText: string;
  /** Not Base properties: the nested `.Item` instances, fixed per story. */
  items: TableOfContentsProps["items"];
  activeId: TableOfContentsProps["activeId"];
};

const LAYOUTS = ["sidebar", "sticky-bar"] as const;

const ITEMS = [
  { id: "key-takeaways", label: "Key takeaways" },
  { id: "why-it-matters", label: "Why it matters" },
  { id: "step-1", label: "Step 1: Cleanse" },
  { id: "step-2", label: "Step 2: Treat" },
  { id: "step-3", label: "Step 3: Hydrate" },
  { id: "step-4", label: "Step 4: Protect" },
  { id: "step-5", label: "Step 5: Sleep" },
  { id: "faq", label: "FAQ" },
];

const meta = {
  title: "Components/Navigation/Table of Contents",
  // The defaults of Figma's `TableOfContents` and `.Base.TableOfContents`.
  args: {
    layout: "sidebar",
    titleText: "On this page",
    showProgress: true,
    progress: 38,
    minutesLeft: 4,
    captionText: "",
    currentText: "",
    items: ITEMS,
    activeId: "step-2",
  },
  render: ({
    titleText,
    showProgress,
    progress,
    minutesLeft,
    captionText,
    currentText,
    ...args
  }) => (
    <TableOfContents
      {...args}
      items={
        currentText
          ? args.items.map((item) =>
              item.id === args.activeId ? { ...item, label: currentText } : item,
            )
          : args.items
      }
      labels={{
        ...TABLE_OF_CONTENTS_LABELS,
        title: titleText,
        caption: captionText ? () => captionText : TABLE_OF_CONTENTS_LABELS.caption,
      }}
      progress={showProgress ? progress : undefined}
      minutesLeft={showProgress ? minutesLeft : undefined}
    />
  ),
  parameters: {
    // The Figma properties: Layout, Title Text, Show Progress, Progress Text, Caption Text, Current Text.
    controls: {
      include: [
        "layout",
        "titleText",
        "showProgress",
        "progress",
        "minutesLeft",
        "captionText",
        "currentText",
      ],
    },
    figma: {
      architecture: "Two-Layer Architecture",
      do: [
        "Build items from the page's H2s and link them to anchor IDs",
        "Highlight exactly one Active item as the reader scrolls",
        "Use progress only on reading content (articles), not on legal/help lists",
        "Keep the sidebar sticky within the article column",
      ],
      dont: [
        "Don't list H3s — keep it to one level",
        "Don't exceed 10 items; group sections instead",
        "Don't use it as primary site navigation",
        "Don't hide the current section on mobile — use the Sticky Bar",
      ],
    },
    docs: {
      description: {
        component:
          "A section indicator for long-form pages. Lists the page's H2 sections, highlights the current one and can show reading progress. Sidebar layout on desktop, Sticky Bar on tablet and mobile.",
      },
    },
  },
  argTypes: {
    layout: {
      description: "Figma `Layout`: Sidebar on desktop; Sticky Bar on tablet/mobile.",
      control: "inline-radio",
      options: LAYOUTS,
      table: {
        type: { summary: '"sidebar" | "sticky-bar"' },
        defaultValue: { summary: "sidebar" },
      },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `labels.title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: "On this page" } },
    },
    showProgress: {
      description: "Figma `Show Progress`. In code: pass `progress`.",
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    progress: {
      description:
        'Figma `Progress Text` (one string, "38% read · about 4 min left"): code builds it from the percent read.',
      control: { type: "number", min: 0, max: 100 },
      if: { arg: "showProgress" },
      table: { type: { summary: "number" }, defaultValue: { summary: "38" } },
    },
    minutesLeft: {
      description: "Figma `Progress Text`: the minutes left, the second part of the string.",
      control: "number",
      if: { arg: "showProgress" },
      table: { type: { summary: "number" }, defaultValue: { summary: "4" } },
    },
    captionText: {
      description:
        "Figma Sticky Bar `Caption Text`. In code: `labels.caption`; blank builds it from the progress.",
      control: "text",
      if: { arg: "layout", eq: "sticky-bar" },
      table: { type: { summary: "string" }, defaultValue: { summary: "On this page · 38% read" } },
    },
    currentText: {
      description: "Figma Sticky Bar `Current Text`. In code: the active item's label.",
      control: "text",
      if: { arg: "layout", eq: "sticky-bar" },
      table: { type: { summary: "string" }, defaultValue: { summary: "Step 2: Treat" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The sidebar of a long article, with reading progress: read, Active and Upcoming items. */
export const Sidebar: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-334">
        <Story />
      </div>
    ),
  ],
};

/** For legal and help lists, which show no progress: before the first section every item is Default. */
export const SidebarUntracked: Story = {
  args: { activeId: null, showProgress: false },
  decorators: Sidebar.decorators,
};

/** Tablet and mobile: tap to open the full list, Esc closes it. */
export const StickyBar: Story = {
  args: { layout: "sticky-bar" },
  decorators: [
    (Story) => (
      <div className="max-w-343">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: /Step 2: Treat/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Step 2: Treat" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    await userEvent.keyboard("{Escape}");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveFocus();
  },
};

/** Figma `.TableOfContents.Item` states: Default · Active · Upcoming. */
export const ItemStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ol className="flex max-w-334 flex-col gap-12">
      <TableOfContentsItem entry={{ id: "a", label: "Section title" }} state="default" />
      <TableOfContentsItem entry={{ id: "b", label: "Section title" }} state="active" />
      <TableOfContentsItem entry={{ id: "c", label: "Section title" }} state="upcoming" />
    </ol>
  ),
};

/** Scroll-spy: without `activeId` the item follows the section at the top of the viewport. */
export const ScrollSpy: Story = {
  args: { activeId: undefined, showProgress: false, items: ITEMS.slice(0, 4) },
  render: ({ items, activeId }) => (
    <div className="flex gap-40">
      <div className="sticky top-0 w-334 self-start">
        <TableOfContents items={items} activeId={activeId} />
      </div>
      <article className="flex flex-1 flex-col gap-24">
        {items.map((item) => (
          <section key={item.id} className="flex min-h-480 flex-col gap-12">
            <h2 id={item.id} className="text-headline-sm text-text-primary">
              {item.label}
            </h2>
            <p className="text-body-md text-text-secondary">Placeholder section copy.</p>
          </section>
        ))}
      </article>
    </div>
  ),
};
