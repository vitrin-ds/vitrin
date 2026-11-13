import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { CardSocialPost } from "./card-social-post";

describe("CardSocialPost", () => {
  it("links a post, named by its creator", async () => {
    const { container } = render(
      <div className="bg-surface-accent-strong">
        <CardSocialPost handle="@sofia.m" href="https://example.com/p/1" />
      </div>,
    );
    const link = screen.getByRole("link", { name: "Post by @sofia.m" });
    expect(link).toHaveAttribute("href", "https://example.com/p/1");
    await expectNoAxeViolations(container);
  });

  it("closes the row with a See more tile", () => {
    render(<CardSocialPost type="see-more" href="/journal" />);
    expect(screen.getByRole("link", { name: /See more/ })).toHaveAttribute("href", "/journal");
  });
});
