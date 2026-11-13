import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Pagination, PAGINATION_LABELS } from "./pagination";
import { SliderPagination } from "./slider-pagination";

type Args = {
  rangeText: string;
};

const hrefFor = (page: number) => `?page=${page}`;

const meta = {
  title: "Components/Navigation/Pagination",
  // The default of Figma's `Pagination Bar`. Page 1 of 10 is fixed: the current page is
  // `Is Active` of the nested `.Asset Page`, not a property of the bar.
  args: { rangeText: "1-10" },
  render: ({ rangeText }) => (
    <Pagination page={1} pageCount={10} hrefFor={hrefFor} rangeText={rangeText} />
  ),
  parameters: {
    // The Figma property of the bar: Range Text.
    controls: { include: ["rangeText"] },
    figma: {
      do: [
        "Show current page clearly with active state",
        "Use ellipsis (...) to truncate long page ranges",
        "Always show first and last page numbers",
        "Include prev/next buttons for quick navigation",
        "Use for carousels, image galleries, or horizontal scroll content",
        "Show progress proportionally to total items",
        "Include prev/next buttons for manual control",
      ],
      dont: [
        "Don't show all pages if more than 7-8 — use truncation",
        "Don't disable both prev and next simultaneously",
        "Don't use for fewer than 2 pages",
        "Don't use for traditional page-based content — use Pagination Bar",
        "Don't hide progress indicator on touch devices",
      ],
    },
    docs: {
      description: {
        component:
          "A navigation system that divides content into discrete pages, allowing users to browse through large datasets or product listings. Includes two variants: a classic numbered pagination and a progress-based slider pagination for carousels.",
      },
    },
  },
  argTypes: {
    rangeText: {
      description: "Figma `Range Text`. In code: `rangeText`.",
      control: "text",
      table: { type: { summary: "ReactNode" }, defaultValue: { summary: "1-10" } },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** Figma Composition `Pagination Bar`: page numbers with prev / next, here 1 (active) … 5, ellipsis, 10. */
export const Default: Story = {};

/** Truncation at the start, middle and end; few pages; prev / next disabled at the ends. */
export const Ranges: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-24">
      {[
        [1, 10],
        [5, 10],
        [10, 10],
        [2, 3],
      ].map(([page, pageCount]) => (
        <Pagination
          key={`${page}-${pageCount}`}
          hrefFor={hrefFor}
          page={page}
          pageCount={pageCount}
          rangeText={pageCount === 3 ? undefined : "1-10"}
          labels={{ ...PAGINATION_LABELS, nav: `Pagination, page ${page} of ${pageCount}` }}
        />
      ))}
    </div>
  ),
};

function Slider() {
  const [current, setCurrent] = useState(3);
  return (
    <SliderPagination
      current={current}
      total={5}
      onPrevious={() => setCurrent((c) => c - 1)}
      onNext={() => setCurrent((c) => c + 1)}
    />
  );
}

/** Figma Composition `Slider Pagination Bar`: progress through a carousel, gallery or horizontal scroll. */
export const SliderBar: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Slider />,
};
