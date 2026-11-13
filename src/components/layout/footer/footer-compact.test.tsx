import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { FooterCompact } from "./footer-compact";

describe("FooterCompact", () => {
  it("is a footer landmark with the wordmark, the links, the contacts and the copyright", async () => {
    const { container } = render(<FooterCompact />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-surface-primary");
    expect(screen.getByText("Vitrin")).toHaveClass("text-display-lg");
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(nav).toHaveTextContent("Products");
    expect(screen.getByRole("link", { name: "Rose Body Cream" })).toHaveAttribute(
      "href",
      "/p/rose-body-cream",
    );
    expect(screen.getByRole("link", { name: "hello@vitrin.example" })).toHaveAttribute(
      "href",
      "mailto:hello@vitrin.example",
    );
    expect(screen.getByText("Phone")).toHaveClass("w-80", "text-right", "text-text-tertiary");
    expect(screen.getAllByText("© Vitrin. All rights reserved")).toHaveLength(2);
    await expectNoAxeViolations(container);
  });
});
