import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { FeedbackPrompt } from "./feedback-prompt";

describe("FeedbackPrompt", () => {
  it("asks with a labelled group of Yes / No buttons", async () => {
    const { container } = render(<FeedbackPrompt />);
    expect(screen.getByRole("group", { name: "Was this article helpful?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await expectNoAxeViolations(container);
  });

  it("reports the answer, then announces and focuses the thank-you message", async () => {
    const onAnswer = vi.fn();
    const { container } = render(<FeedbackPrompt onAnswer={onAnswer} />);
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onAnswer).toHaveBeenCalledWith("yes");
    expect(screen.queryByRole("button")).toBeNull();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Thanks — your feedback helps us improve this page.");
    expect(status).toHaveClass("text-text-success");
    expect(status).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("can start answered", () => {
    render(<FeedbackPrompt answered />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Thanks");
    expect(screen.getByRole("status")).not.toHaveFocus();
  });
});
