import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { Callout } from "./callout";

describe("Callout", () => {
  it("renders a Summary with a heading title and a bullet list", async () => {
    const { container } = render(
      <Callout title="Key takeaways" headingLevel={2} titleId="takeaways" items={["One", "Two"]} />,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Key takeaways" });
    expect(heading).toHaveAttribute("id", "takeaways");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.firstChild).toHaveClass("bg-(--th-callout-accent-surface-bg)", "border-l-4");
    await expectNoAxeViolations(container);
  });

  it("renders the title as plain text without a heading level, and Tip on outline tokens", () => {
    const { container } = render(
      <Callout type="tip" title="Expert tip">
        Go slow.
      </Callout>,
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("Expert tip")).toHaveClass("text-(--th-callout-accent-outline-text)");
    expect(container.firstChild).toHaveClass("border-(--th-callout-accent-outline-border)");
  });

  it("renders a Quote as figure, blockquote and figcaption", async () => {
    const { container } = render(
      <Callout type="quote" attribution="Dr. Alex Moreno" cite="https://example.com/a">
        Barrier first.
      </Callout>,
    );
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toHaveAttribute("cite", "https://example.com/a");
    expect(container.querySelector("blockquote")).toHaveTextContent("“Barrier first.”");
    expect(container.querySelector("figcaption")).toHaveTextContent("Dr. Alex Moreno");
    await expectNoAxeViolations(container);
  });
});
