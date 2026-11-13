import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ReviewCard } from "./review-card";
import { ReviewHelpful } from "./review-helpful";

describe("ReviewHelpful", () => {
  it("is a named group of two toggle buttons with their counts", async () => {
    const { container } = render(
      <ReviewHelpful helpfulCount={12} notHelpfulCount={1} onVote={vi.fn()} />,
    );
    const group = screen.getByRole("group", { name: "Was this review helpful?" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes, helpful 12" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "No, not helpful 1" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("votes once", async () => {
    const onVote = vi.fn();
    const { rerender } = render(
      <ReviewHelpful helpfulCount={12} notHelpfulCount={1} onVote={onVote} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /^Yes/ }));
    expect(onVote).toHaveBeenCalledWith("helpful");
    rerender(
      <ReviewHelpful helpfulCount={12} notHelpfulCount={1} vote="helpful" onVote={onVote} />,
    );
    const yes = screen.getByRole("button", { name: "Yes, helpful 13" });
    expect(yes).toHaveAttribute("aria-pressed", "true");
    expect(yes).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("button", { name: /^No/ }));
    expect(onVote).toHaveBeenCalledTimes(1);
  });
});

describe("ReviewCard actions and pending", () => {
  it("renders the actions slot and the pending label instead of verified", () => {
    render(
      <ReviewCard
        author="Me"
        date="2026-10-31T00:00:00.000Z"
        rating={5}
        body="Lovely texture and it lasts all day."
        verified
        pendingLabel="Awaiting moderation"
        actions={<ReviewHelpful helpfulCount={0} notHelpfulCount={0} />}
      />,
    );
    expect(screen.getByText("Awaiting moderation")).toBeInTheDocument();
    expect(screen.queryByText("Verified purchase")).toBeNull();
    expect(screen.getByRole("group", { name: "Was this review helpful?" })).toBeInTheDocument();
  });
});
