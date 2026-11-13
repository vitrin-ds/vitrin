import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { DataTable } from "./data-table";

const COLUMNS = ["Skin type", "Texture", "Look for"];
const ROWS = [
  ["Oily", "Gel or gel-cream", "Niacinamide"],
  ["Dry", "Rich cream", "Ceramides"],
];

describe("DataTable", () => {
  it("is a semantic table with a caption, column headers and cells", async () => {
    const { container } = render(
      <DataTable caption="Moisturiser texture by skin type" columns={COLUMNS} rows={ROWS} />,
    );
    const table = screen.getByRole("table", { name: "Moisturiser texture by skin type" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(within(table).getAllByRole("cell")).toHaveLength(6);
    expect(screen.getByText("Moisturiser texture by skin type")).toHaveClass("sr-only");
    // The scroll container is a named, focusable region (keyboard users can scroll it).
    expect(
      screen.getByRole("region", { name: "Moisturiser texture by skin type" }),
    ).toHaveAttribute("tabindex", "0");
    await expectNoAxeViolations(container);
  });

  it("can show the caption and use the first cell as a row header", async () => {
    const { container } = render(
      <DataTable caption="Textures" showCaption rowHeaders columns={COLUMNS} rows={ROWS} />,
    );
    expect(screen.getByText("Textures")).not.toHaveClass("sr-only");
    expect(screen.getAllByRole("rowheader").map((th) => th.textContent)).toEqual(["Oily", "Dry"]);
    await expectNoAxeViolations(container);
  });
});

describe("DataTable rich cells", () => {
  it("renders the Table Header and Table Cell slots that are given", async () => {
    const { container } = render(
      <DataTable
        caption="Orders"
        columns={[
          { label: "Order", hideLabel: true, align: "right", rightIcon: "keyboard_arrow_down" },
        ]}
        rows={[
          [
            {
              title: "Serum",
              description: "Two items",
              align: "right",
              leftIcon: "star",
              status: { status: "success", label: "Active" },
              checkbox: { label: "Select Serum" },
            },
          ],
        ]}
      />,
    );
    expect(
      screen.getByRole("columnheader", { name: "Order" }).querySelector(".sr-only"),
    ).toHaveTextContent("Order");
    expect(screen.getByRole("checkbox", { name: "Select Serum" })).toBeInTheDocument();
    expect(screen.getByText("Two items")).toHaveClass("text-text-tertiary");
    expect(container.querySelector('td [data-icon="star"]')).toBeInTheDocument();
    expect(container.querySelector("td > span")).toHaveClass("justify-end");
    await expectNoAxeViolations(container);
  });
});
