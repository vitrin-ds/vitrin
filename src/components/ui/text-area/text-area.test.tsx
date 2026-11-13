import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { TextArea, TEXT_AREA_DEFAULTS } from "./text-area";

describe("TextArea", () => {
  it("is a labelled, resizable multi-line field", async () => {
    const { container } = render(<TextArea label="Review" placeholder="What did you think?" />);
    const area = screen.getByRole("textbox", { name: "Review" });
    expect(area.tagName).toBe("TEXTAREA");
    expect(area).toHaveAttribute("rows", String(TEXT_AREA_DEFAULTS.rows));
    expect(area).toHaveClass("resize-y", "p-12", "rounded-control", "min-h-144");
    await expectNoAxeViolations(container);
  });

  it("counts characters against maxLength", async () => {
    render(<TextArea label="Gift message" maxLength={120} showCount defaultValue="Hi" />);
    expect(screen.getByText("2/120")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("textbox", { name: "Gift message" }), " there");
    expect(screen.getByText("8/120")).toBeInTheDocument();
  });

  it("follows the value when controlled", () => {
    render(
      <TextArea label="Note" maxLength={10} showCount value="abc" onChange={() => undefined} />,
    );
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("wires the error message and invalid state", async () => {
    const { container } = render(
      <TextArea label="Review" required errorText="Write at least 20 characters" />,
    );
    const area = screen.getByRole("textbox", { name: "Review" });
    expect(area).toBeRequired();
    expect(area).toHaveAttribute("aria-invalid", "true");
    expect(area).toHaveAccessibleDescription("Write at least 20 characters");
    await expectNoAxeViolations(container);
  });

  it("is not editable when disabled", () => {
    render(<TextArea label="Notes" disabled />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeDisabled();
  });
});
