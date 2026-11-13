import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { CompareBar } from "./compare-bar";
import { COMPARE_ATTRIBUTES, COMPARE_PRODUCTS } from "./compare-products.fixtures";
import { CompareTable, type CompareTableProps } from "./compare-table";
import { toggleCompare } from "./compare-types";

const meta = {
  title: "Patterns/Discovery/Compare Products",
  component: CompareTable,
  args: { products: COMPARE_PRODUCTS, attributes: COMPARE_ATTRIBUTES },
  parameters: {
    // A composition pattern: the Figma page has no property table, so no controls.
    controls: { disable: true },
    figma: {
      architecture:
        "Composition pattern: assembled from library components, no base layer of its own.",
      do: [
        "Limit comparison to 3 products (2 on mobile)",
        "Use the same attribute order for every product",
        "Highlight differences, not similarities",
        "Keep the compare bar visible while browsing",
      ],
      dont: [
        "Don't compare products from unrelated categories",
        "Don't hide price or rating",
        "Don't lose the selection when filters change",
        "Don't open compare in a new tab",
      ],
    },
    docs: {
      description: {
        component:
          "Side-by-side comparison of up to 3 products: a sticky compare bar collects products from the list; the compare view shows them in columns with attribute rows.",
      },
    },
  },
} satisfies Meta<typeof CompareTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The compare view: a label column and up to three product columns. Below desktop it scrolls sideways; the label column sticks. */
export const Table: Story = {};

/** With a remove action per product column. */
export const TableWithRemove: Story = { render: (args) => <RemovableTable {...args} /> };

function RemovableTable(args: CompareTableProps) {
  const [products, setProducts] = useState(args.products);
  return (
    <CompareTable
      {...args}
      products={products}
      onRemove={(id) => setProducts((list) => list.filter((p) => p.id !== id))}
    />
  );
}

/** Two products, the limit on mobile. */
export const TwoProducts: Story = { args: { products: COMPARE_PRODUCTS.slice(0, 2) } };

/**
 * The compare bar, fixed to the bottom of the list. Add products with the buttons;
 * a fourth is refused (max 3) and the reason is announced.
 */
export const Bar: Story = { render: () => <BarDemo /> };

function BarDemo() {
  const [ids, setIds] = useState<readonly string[]>(["p1", "p2"]);
  const [message, setMessage] = useState("");
  const selected = COMPARE_PRODUCTS.filter((p) => ids.includes(p.id));
  return (
    <div className="flex flex-col gap-16 pb-120">
      <div className="flex flex-wrap gap-8">
        {COMPARE_PRODUCTS.map((p) => (
          <Button
            key={p.id}
            variant="outline"
            size="sm"
            aria-pressed={ids.includes(p.id)}
            onClick={() => {
              const result = toggleCompare(ids, p.id);
              setIds(result.ids);
              setMessage(result.status === "full" ? "You can compare up to 3 products." : "");
            }}
          >
            {p.name}
          </Button>
        ))}
      </div>
      <p role="status" className="text-body-sm text-text-secondary">
        {message}
      </p>
      <CompareBar
        products={selected}
        onRemove={(id) => setIds((list) => list.filter((x) => x !== id))}
        onClear={() => setIds([])}
        compareHref={`/compare?ids=${ids.join(",")}`}
      />
    </div>
  );
}
