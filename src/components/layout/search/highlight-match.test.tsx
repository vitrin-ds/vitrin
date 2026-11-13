import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HighlightMatch, findMatches } from "./highlight-match";

describe("findMatches", () => {
  it("finds every case-insensitive occurrence without overlaps", () => {
    expect(findMatches("Face wash for the face", "FACE")).toEqual([
      { start: 0, end: 4 },
      { start: 18, end: 22 },
    ]);
    expect(findMatches("aaaa", "aa")).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]);
  });

  it("returns nothing for a blank query or no match", () => {
    expect(findMatches("Face", "  ")).toEqual([]);
    expect(findMatches("Face", "soap")).toEqual([]);
  });

  it("trims the query", () => {
    expect(findMatches("Face mask", " mask ")).toEqual([{ start: 5, end: 9 }]);
  });
});

describe("HighlightMatch", () => {
  it("wraps matches in a bold mark and keeps the rest as text", () => {
    const { container } = render(
      <p>
        <HighlightMatch text="Refund your refund" query="refund" className="text-text-primary" />
      </p>,
    );
    const marks = container.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0]).toHaveClass("bg-transparent", "text-text-primary");
    expect(marks[0].querySelector("strong")).toHaveTextContent("Refund");
    expect(container).toHaveTextContent("Refund your refund");
  });

  it("renders plain text when nothing matches", () => {
    const { container } = render(
      <p>
        <HighlightMatch text="<b>Face</b>" query="soap" />
      </p>,
    );
    expect(container.querySelector("mark")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(container).toHaveTextContent("<b>Face</b>");
  });
});
