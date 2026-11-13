import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Pagination, paginationRange } from "./pagination";
import { SliderPagination } from "./slider-pagination";

const href = (p: number) => `/c/skincare?page=${p}`;

describe("paginationRange", () => {
  it("lists every page up to 7", () => {
    expect(paginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps first and last and truncates with ellipses (max 7 items)", () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(paginationRange(4, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(paginationRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(paginationRange(7, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    expect(paginationRange(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });
});

describe("Pagination", () => {
  it("renders crawlable page links and marks the current page", async () => {
    const { container } = render(
      <Pagination page={5} pageCount={10} hrefFor={href} rangeText="97–120 of 230" />,
    );
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    const current = screen.getByRole("link", { name: "Page 5" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("bg-interactive-default", "");
    expect(screen.getByRole("link", { name: "Page 10" })).toHaveAttribute(
      "href",
      "/c/skincare?page=10",
    );
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/c/skincare?page=4",
    );
    expect(screen.getByText("97–120 of 230")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("disables previous on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} hrefFor={href} />);
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("link", { name: "Previous page" })).not.toHaveAttribute("href");
    rerender(<Pagination page={3} pageCount={3} hrefFor={href} />);
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("hides the ellipsis from assistive technology and has 36px items with a 44px hit area", () => {
    const { container } = render(<Pagination page={1} pageCount={20} hrefFor={href} />);
    expect(container.querySelector('li[aria-hidden="true"]')).toHaveTextContent("…");
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveClass("size-36", "before:-inset-4");
  });

  it("renders nothing for a single page (Figma Don't)", () => {
    const { container } = render(<Pagination page={1} pageCount={1} hrefFor={href} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SliderPagination", () => {
  it("shows progress and steps with buttons that stop at the ends", async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const { container, rerender } = render(
      <SliderPagination current={1} total={4} onPrevious={onPrevious} onNext={onNext} />,
    );
    expect(screen.getByRole("progressbar", { name: "Position" })).toHaveAttribute(
      "aria-valuetext",
      "1 of 4",
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onNext).toHaveBeenCalled();
    rerender(<SliderPagination current={4} total={4} onPrevious={onPrevious} onNext={onNext} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await expectNoAxeViolations(container);
  });
});
