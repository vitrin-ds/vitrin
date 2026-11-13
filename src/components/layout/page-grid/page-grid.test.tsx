import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Container } from "../container/container";
import { PageGrid } from "./page-grid";

describe("PageGrid", () => {
  it("applies the page-grid utility to the chosen element", () => {
    render(
      <PageGrid as="section" aria-label="Products">
        <div className="col-span-4">Card</div>
      </PageGrid>,
    );
    const grid = screen.getByRole("region", { name: "Products" });
    expect(grid.tagName).toBe("SECTION");
    expect(grid).toHaveClass("page-grid");
  });
});

describe("Container", () => {
  it("centres content at max 1440 with the page margin", () => {
    render(<Container as="main">Content</Container>);
    const main = screen.getByRole("main");
    expect(main).toHaveClass("mx-auto", "max-w-(--breakpoint-wide)", "px-(--th-grid-margin)");
  });
});
