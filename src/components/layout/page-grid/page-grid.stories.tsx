import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "../container/container";
import { PageGrid } from "./page-grid";

const meta = {
  title: "Foundations/Spacing & Grid/PageGrid",
  component: PageGrid,
  parameters: {
    layout: "fullscreen",
    // Figma lists no properties for the grid: it is the layout grid style per breakpoint.
    controls: { disable: true },
    figma: {
      do: [
        "Start and end content blocks on column edges",
        "Use the spans above for recurring layouts",
        "Apply the grid style to every new frame",
        "Let content between 1024 and 1440 scale fluidly",
      ],
      dont: [
        "Don't place content inside the page margin",
        "Don't use custom widths that ignore the columns",
        "Don't change gutter per breakpoint",
        "Don't stretch content beyond 1440px",
      ],
    },
    docs: {
      description: {
        component:
          "Every page is built on a column grid per breakpoint: 4 columns on mobile, 6 on tablet and 12 on desktop, always with an 8px gutter.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof PageGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const COLUMNS = Array.from({ length: 12 }, (_, i) => i);
const VISIBLE = (i: number) =>
  i < 4 ? "block" : i < 6 ? "hidden tablet:block" : "hidden desktop:block";

/** 4 / 6 / 12 columns, 8px gutter, 16 / 16 / 40px margin (Figma grid styles 375 / 744 / 1440). */
export const Columns: Story = {
  render: () => (
    <PageGrid className="py-24">
      {COLUMNS.map((i) => (
        <span key={i} className={`h-120 rounded-4 bg-surface-accent-subtle ${VISIBLE(i)}`} />
      ))}
    </PageGrid>
  ),
};

/** Figma "Desktop Column Spans": 3 = 334, 4 = 448, 6 = 676, 7 = 790, 8 = 904px at 1440. */
export const Spans: Story = {
  render: () => (
    <PageGrid className="gap-y-8 py-24">
      <span className="col-span-full h-24 rounded-4 bg-surface-accent desktop:col-span-3" />
      <span className="col-span-full h-24 rounded-4 bg-surface-accent desktop:col-span-4" />
      <span className="col-span-full h-24 rounded-4 bg-surface-accent desktop:col-span-6" />
      <span className="col-span-full h-24 rounded-4 bg-surface-accent desktop:col-span-7" />
      <span className="col-span-full h-24 rounded-4 bg-surface-accent desktop:col-span-8" />
    </PageGrid>
  ),
};

/** Article layout: table of contents (3) + main column (8), stacked on mobile. */
export const SidebarLayout: Story = {
  render: () => (
    <PageGrid as="main" className="gap-y-16 py-24">
      <nav
        aria-label="Contents"
        className="col-span-full rounded-8 border border-border-default p-16 desktop:col-span-3"
      >
        <p className="text-title-sm text-text-primary">Contents</p>
      </nav>
      <article className="col-span-full rounded-8 border border-border-default p-16 desktop:col-span-8 desktop:col-start-5">
        <h1 className="text-headline-md text-text-primary">Main column</h1>
      </article>
    </PageGrid>
  ),
};

/** Container: same width and margins without columns. */
export const ContainerOnly: Story = {
  render: () => (
    <Container className="py-24">
      <p className="rounded-4 bg-surface-accent-subtle p-16 text-body-md text-text-primary">
        Max 1440px, 16 / 16 / 40px side margin.
      </p>
    </Container>
  ),
};
