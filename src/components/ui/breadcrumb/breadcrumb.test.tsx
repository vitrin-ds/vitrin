import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Breadcrumb } from "./breadcrumb";

const ITEMS = [
  { label: "Skincare", href: "/c/skincare" },
  { label: "Serums", href: "/c/skincare/serums" },
];

describe("Breadcrumb", () => {
  it("is a labelled nav with an ordered trail, Home first and the current page last", async () => {
    const { container } = render(<Breadcrumb items={ITEMS} current="Glow serum" />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const items = nav.querySelectorAll("ol > li");
    expect(items).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Serums" })).toHaveAttribute(
      "href",
      "/c/skincare/serums",
    );
    await expectNoAxeViolations(container);
  });

  it("marks the current page and does not link it (Figma Don't)", () => {
    render(<Breadcrumb items={ITEMS} current="Glow serum" />);
    const current = screen.getByText("Glow serum");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.closest("a")).toBeNull();
    expect(current).toHaveClass("bg-surface-accent", "text-text-on-accent", "text-label-md");
  });

  it("draws pill nodes with a 44px hit area and decorative separators", () => {
    const { container } = render(<Breadcrumb items={ITEMS} current="Glow serum" />);
    expect(screen.getByRole("link", { name: "Skincare" })).toHaveClass(
      "rounded-full",
      "inset-ring-border-neutral",
      "before:-inset-y-12",
    );
    const separators = container.querySelectorAll('[data-icon="keyboard_arrow_right"]');
    expect(separators).toHaveLength(3);
    separators.forEach((s) => expect(s).toHaveAttribute("aria-hidden", "true"));
  });
});
