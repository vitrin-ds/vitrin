import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisuallyHidden } from "./visually-hidden";

describe("VisuallyHidden", () => {
  it("keeps text in the accessibility tree but off screen", () => {
    render(
      <button type="button">
        <span aria-hidden>♥</span>
        <VisuallyHidden>Add to wishlist</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Add to wishlist" })).toBeInTheDocument();
    expect(screen.getByText("Add to wishlist")).toHaveClass("sr-only");
  });

  it("shows a focusable skip link only while it has focus", () => {
    render(
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>,
    );
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveClass("not-focus:sr-only");
    expect(link).not.toHaveClass("sr-only");
  });
});
