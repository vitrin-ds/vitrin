import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading, Text } from "./text";

describe("Text", () => {
  it("defaults to body-md, primary colour, in a <p>", () => {
    render(<Text>Free delivery over €50</Text>);
    const el = screen.getByText("Free delivery over €50");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("text-body-md", "text-text-primary");
  });

  it("keeps the type style when a colour is added (tailwind-merge config)", () => {
    render(
      <Text variant="title-md" tone="secondary">
        Title
      </Text>,
    );
    expect(screen.getByText("Title")).toHaveClass("text-title-md", "text-text-secondary");
  });

  it("renders labels as <span> and code styles in mono", () => {
    render(
      <>
        <Text variant="label-md">Label</Text>
        <Text variant="code-sm">SKU-001</Text>
      </>,
    );
    expect(screen.getByText("Label").tagName).toBe("SPAN");
    expect(screen.getByText("SKU-001")).toHaveClass("font-mono", "text-code-sm");
  });

  it("supports any element and tabular figures for prices", () => {
    render(
      <Text as="data" value="24.9" variant="title-sm" numeric>
        €24.90
      </Text>,
    );
    const el = screen.getByText("€24.90");
    expect(el.tagName).toBe("DATA");
    expect(el).toHaveAttribute("value", "24.9");
    expect(el).toHaveClass("tabular-nums");
  });
});

describe("Heading", () => {
  it("renders the requested level independent of the visual size", () => {
    render(
      <Heading level={2} variant="display-sm">
        New in
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "New in" });
    expect(heading).toHaveClass("text-display-sm");
  });
});
