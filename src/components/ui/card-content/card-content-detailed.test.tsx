import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardContentDetailed } from "./card-content-detailed";

const PROPS = {
  title: "Vitamin C vs. niacinamide",
  href: "/journal/skincare/vitamin-c",
  image: { src: "/dev/sample-wide.webp", alt: "Two serum bottles", width: 1600, height: 900 },
};

describe("CardContentDetailed", () => {
  it("is an article with category, linked title, excerpt and meta", async () => {
    const { container } = render(
      <CardContentDetailed
        {...PROPS}
        category="Skincare"
        excerpt="Both brighten and protect."
        meta="12 Oct 2026 · 6 min read"
      />,
    );
    const link = screen.getByRole("link", { name: PROPS.title });
    expect(link).toHaveAttribute("href", PROPS.href);
    expect(link).toHaveClass("after:absolute", "after:inset-0", "line-clamp-3");
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass(
      "text-title-md",
      "group-hover/card:text-text-accent",
      "group-hover/card:underline",
    );
    expect(screen.getByText("Skincare")).toHaveClass("text-label-md", "text-text-accent");
    expect(screen.getByText("Both brighten and protect.")).toHaveClass("text-text-secondary");
    expect(screen.getByText("12 Oct 2026 · 6 min read")).toHaveClass("text-label-sm");
    await expectNoAxeViolations(container);
  });

  it("leaves out the optional slots and takes a heading level", () => {
    const { container } = render(<CardContentDetailed {...PROPS} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
