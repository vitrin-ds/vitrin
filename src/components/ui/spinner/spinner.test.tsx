import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("announces its label as a status", async () => {
    const { container } = render(<Spinner label="Loading products" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading products");
    await expectNoAxeViolations(container);
  });

  it("maps the Figma sizes 12 / 16 / 24 / 32", () => {
    const sizes = { xs: "size-12", sm: "size-16", md: "size-24", lg: "size-32" } as const;
    for (const [size, cls] of Object.entries(sizes)) {
      const { container, unmount } = render(
        <Spinner label="Loading" size={size as keyof typeof sizes} />,
      );
      expect(container.querySelector("svg")).toHaveClass(cls);
      unmount();
    }
  });

  it("draws a 270° arc with stroke = size / 10", () => {
    const { container } = render(<Spinner label="Loading" />);
    const arc = container.querySelector("circle")!;
    expect(arc).toHaveAttribute("stroke-dasharray", "75 25");
    expect(arc).toHaveAttribute("stroke-width", "2.4");
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("only spins when motion is allowed", () => {
    const { container } = render(<Spinner label="Loading" />);
    expect(container.querySelector("svg")).toHaveClass("motion-safe:animate-spin");
  });

  it("renders only the graphic when the parent announces the busy state", () => {
    const { container } = render(<Spinner label={null} />);
    expect(screen.queryByRole("status")).toBeNull();
    expect(container.firstElementChild!.tagName).toBe("svg");
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
