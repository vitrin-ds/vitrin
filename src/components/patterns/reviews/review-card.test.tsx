import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ReviewCard } from "./review-card";

const photo = { src: "/p.webp", alt: "Customer photo", width: 44, height: 44 };

describe("ReviewCard", () => {
  it("is an article headed by the reviewer, with date, score, title and comment", async () => {
    const { container } = render(
      <ReviewCard
        author="Amira K."
        date="2026-12-21T00:00:00.000Z"
        rating={4}
        title="Love it"
        body="Absorbs quickly."
        verified
        locale="de"
      />,
    );
    const article = screen.getByRole("article");
    expect(screen.getByRole("heading", { level: 3, name: "Amira K." })).toBeInTheDocument();
    expect(screen.getByText("21.12.2026")).toHaveAttribute("datetime", "2026-12-21T00:00:00.000Z");
    expect(article).toHaveTextContent("Love it");
    expect(article).toHaveTextContent("Verified purchase");
    expect(article).toHaveClass("rounded-card", "inset-ring-border-neutral");
    await expectNoAxeViolations(container);
  });

  it("shows five photos and a +N tile for the rest", () => {
    render(
      <ReviewCard
        author="Ben T."
        date="2026-10-01T00:00:00.000Z"
        rating={5}
        body="Nice."
        photos={Array.from({ length: 7 }, () => photo)}
      />,
    );
    expect(screen.getAllByRole("img", { name: "Customer photo" })).toHaveLength(5);
    expect(screen.getByText("+2 more photos")).toBeInTheDocument();
  });

  it("has a borderless list variant and a heading level", () => {
    render(
      <ReviewCard
        author="Chloé R."
        date="2026-10-01T00:00:00.000Z"
        rating={3}
        body="Fine."
        variant="list"
        headingLevel={2}
      />,
    );
    expect(screen.getByRole("article")).toHaveClass("border-b");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Chloé R.");
  });
});
