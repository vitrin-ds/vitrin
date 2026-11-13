import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { ErrorSummary } from "./error-summary";

describe("ErrorSummary", () => {
  it("is a focusable Negative alert whose links move focus to the fields", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <ErrorSummary
          id="summary"
          title="Check the highlighted fields"
          errors={[{ id: "email", label: "E-mail", message: "Enter your e-mail address." }]}
        />
        <input id="email" aria-label="E-mail" />
      </>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("tabindex", "-1");
    expect(alert).toHaveClass("rounded-card");
    const link = screen.getByRole("link", { name: "E-mail: Enter your e-mail address." });
    expect(link).toHaveAttribute("href", "#email");
    await user.click(link);
    expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("is the title alone without field errors", () => {
    render(<ErrorSummary id="summary" title="The e-mail or password is incorrect." />);
    expect(screen.getByRole("alert")).toHaveTextContent("The e-mail or password is incorrect.");
    expect(screen.queryByRole("list")).toBeNull();
  });
});
