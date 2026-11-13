import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { StepList } from "./step-list";

const STEPS = [
  { title: "Find your order", description: "Open My Account." },
  { title: "Choose the items" },
  { title: "Drop it off", description: "Any parcel shop." },
];

describe("StepList", () => {
  it("is an ordered list with numbered steps", async () => {
    const { container } = render(<StepList steps={STEPS} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[2]).toHaveTextContent("3Drop it off");
    expect(within(items[1]!).queryByText("Open My Account.")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("renders the titles as headings with a level", () => {
    render(<StepList steps={STEPS} headingLevel={3} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });
});
