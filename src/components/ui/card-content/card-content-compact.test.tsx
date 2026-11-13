import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardContentCompact } from "./card-content-compact";

const PROPS = {
  title: "Thoughtful essentials for your routine",
  href: "/journal/rituals/essentials",
  image: { src: "/dev/sample-wide.webp", alt: "Bottles on a shelf", width: 1600, height: 900 },
};

describe("CardContentCompact", () => {
  it("links the heading over the whole card and marks the date up as <time>", async () => {
    const { container } = render(
      <CardContentCompact {...PROPS} dateTime="12 Oct 2026" dateTimeISO="2026-10-12" />,
    );
    const link = screen.getByRole("link", { name: PROPS.title });
    expect(link).toHaveAttribute("href", PROPS.href);
    expect(link).toHaveClass("after:absolute", "after:inset-0", "line-clamp-2");
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("text-title-lg");
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-10-12");
    expect(screen.getByRole("img", { name: "Bottles on a shelf" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("hides the date when it isn't given and accepts a plain date text", () => {
    const { container, rerender } = render(<CardContentCompact {...PROPS} headingLevel={2} />);
    expect(screen.queryByText("12 Oct 2026")).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    rerender(<CardContentCompact {...PROPS} dateTime="Yesterday" />);
    expect(screen.getByText("Yesterday")).toHaveClass("text-text-accent");
    expect(container.querySelector("time")).toBeNull();
  });
});
